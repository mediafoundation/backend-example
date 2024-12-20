import {Blockchain, EventsHandler, http, Marketplace, Sdk, validChains} from "media-sdk"
import {lastReadBlockCollection} from "./database/database"
import {EventsController} from "./database/controllers/eventsController"
import {createRelationsBetweenTables, resetMongoDB} from "./database/utils"
import EventsUtils from "./utils/events"
import {httpNetworks} from "./networks"

const BATCH_SIZE = 1000n

const marketplaceGenesisBlock: {[index: number]: bigint} = {
  11155111: 6817833n,
  84532: 16170075n
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) )
}

async function getPastEvents(eventsHandler: EventsHandler, blockChain: Blockchain, chainId: number) {
  console.log("Getting past events on chain:", chainId)
  const lastBlockOnDb = await lastReadBlockCollection.findOne({chainId: chainId})
  let blockToRead = lastBlockOnDb ? BigInt(lastBlockOnDb.block) : marketplaceGenesisBlock[chainId]

  const currentBlock = await blockChain.getBlockNumber()

  console.log("Current block", currentBlock, "on chain", chainId)

  while (blockToRead + BATCH_SIZE < currentBlock) {
    try {
      const events = []

      //events.push(...await eventsHandler.getResourcesPastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: blockToRead + BATCH_SIZE}))
      events.push(...await eventsHandler.getMarketplacePastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: blockToRead + BATCH_SIZE}))

      for (const event of events) {
        const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
        await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
      }

      await lastReadBlockCollection.updateOne({block: blockToRead, chainId: chainId}, {$set: {block: blockToRead + BATCH_SIZE}}, {upsert: true})
      blockToRead = blockToRead + BATCH_SIZE
    } catch (e) {
      console.log(e)
    }

    await delay(1000)
  }

  try {
    const events = []

    //events.push(...await eventsHandler.getResourcesPastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: blockToRead + BATCH_SIZE}))
    events.push(...await eventsHandler.getMarketplacePastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: currentBlock}))

    for (const event of events) {
      const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
      await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
    }

    await lastReadBlockCollection.updateOne({block: blockToRead, chainId: chainId}, {$set: {block: currentBlock}}, {upsert: true})
  } catch (e) {
    console.log(e)
  }

  console.log("Finish getting past events on chain:", chainId)
}

/*export async function manageResourceUpdated(event: any, resources: Resources, blockChain: Blockchain, chainId: number) {
  const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
  await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
  const resource = await resources.getResource({
    id: event._resourceId,
    address: event._resourceAddress
  })

  await ResourcesController.upsertResource(ResourcesController.formatResource(resource), chainId)
}*/

async function getEvents(eventsHandler: EventsHandler, blockChain: Blockchain, marketplace: Marketplace, chainId: number) {
  const lastReadBlock = await lastReadBlockCollection.findOne({chainId: chainId})
  const blockToRead = await blockChain.getBlockNumber()

  console.log("Current block", blockToRead, "on chain", chainId)
  console.log(`Getting events on blocks: ${lastReadBlock!.block + 1} - ${blockToRead}`)
  if(blockToRead >= BigInt(lastReadBlock!.block) + 1n) {
    const dealCreated = await eventsHandler.getMarketplacePastEvents({
      eventName: "DealCreated",
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })

    const addedBalance = await eventsHandler.getMarketplacePastEvents({
      eventName: "AddedBalance",
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })

    const dealAccepted = await eventsHandler.getMarketplacePastEvents({
      eventName: "DealAccepted",
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })

    const offerCreated = await eventsHandler.getMarketplacePastEvents({
      eventName: "OfferCreated",
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })

    const offerUpdated = await eventsHandler.getMarketplacePastEvents({
      eventName: "OfferUpdated",
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })

    //todo: check if offer should be deleted or not
    /*const offerDeleted = await eventsHandler.getMarketplacePastEvents({
      eventName: "OfferDeleted",
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })*/

    for (const event of dealAccepted) {
      console.log("DealAccepted", event)
      await EventsUtils.manageDealUpdated(event, marketplace, blockChain, chainId)
    }

    for (const event of dealCreated) {
      console.log("DealCreated", event)
      await EventsUtils.manageDealUpdated(event, marketplace, blockChain, chainId)
    }

    for (const event of addedBalance) {
      console.log("AddedBalance", event)
      await EventsUtils.manageDealUpdated(event, marketplace, blockChain, chainId)
    }

    for (const event of offerCreated) {
      console.log("OfferCreated", event)
      await EventsUtils.manageOfferUpdated(event, marketplace, blockChain, chainId)
    }

    for (const event of offerUpdated) {
      console.log("OfferUpdated", event)
      await EventsUtils.manageOfferUpdated(event, marketplace, blockChain, chainId)
    }

    await lastReadBlockCollection.updateOne({block: lastReadBlock!.block, chainId: chainId}, {$set: {block: blockToRead}}, {upsert: true})
  }

}

async function start() {
  await createRelationsBetweenTables()
  await resetMongoDB()
  try {
    const chains: any[] = Object.values(validChains)
    for (const chain of chains) {
      const sdk = new Sdk({chain: chain, transport: [http(httpNetworks![chain.name][0])]})
      await getPastEvents(new EventsHandler(sdk), new Blockchain(sdk), chain.id)
    }
  } catch (e) {
    console.log("Error", e)
  }
}

start()
  .then(() => {
    console.log("Past events gotten")
    console.log("Start getting new events")
    setInterval(async () => {
      try {
        const chains: any[] = Object.values(validChains)
        for (const chain of chains) {
          const sdk = new Sdk({chain: chain, transport: [http(httpNetworks![chain.name][0])]})
          await getEvents(new EventsHandler(sdk), new Blockchain(sdk), new Marketplace(sdk), chain.id)
        }
      } catch (e) {
        console.log("Error", e)
      }
    }, 60000 * 5) //Every 5 minutes
  })
