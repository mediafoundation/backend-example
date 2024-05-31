import {Blockchain, EventsHandler, Marketplace, Sdk, validChains} from "media-sdk"
import {lastReadBlockCollection} from "./database/database"
import {EventsController} from "./database/controllers/eventsController"
import {createRelationsBetweenTables, resetMongoDB} from "./database/utils"
import {DealsController} from "./database/controllers/dealsController"

const BATCH_SIZE = 1000n

const marketplaceGenesisBlock: {[index: number]: bigint} = {
  11155111: 5284652n,
  84532: 6059860n
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) )
}

async function getPastEvents(eventsHandler: EventsHandler, blockChain: Blockchain, chainId: number) {
  console.log("Getting past events on chain:", chainId)
  const lastBlockOnDb = await lastReadBlockCollection.findOne({chainId: chainId})
  let blockToRead = lastBlockOnDb ? BigInt(lastBlockOnDb.block) : marketplaceGenesisBlock[chainId]

  const currentBlock = await blockChain.getBlockNumber()

  while (blockToRead < currentBlock) {
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

  console.log("Finish getting past events on chain:", chainId)
}

async function manageDealUpdated(event: any, marketplace: Marketplace, blockChain: Blockchain, chainId: number) {
  const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
  await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
  const deal = await marketplace.getDealById({
    marketplaceId: process.env.MARKETPLACE_ID,
    dealId: event._dealId
  })

  await DealsController.upsertDeal(DealsController.formatDeal(deal), chainId)
}

async function getEvents(eventsHandler: EventsHandler, blockChain: Blockchain, marketplace: Marketplace, chainId: number) {
  const lastReadBlock = await lastReadBlockCollection.findOne({chainId: chainId})
  const blockToRead = await blockChain.getBlockNumber()
  console.log(`Getting events on blocks: ${lastReadBlock!.block + 1} - ${blockToRead}`)
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

  for (const event of dealAccepted) {
    await manageDealUpdated(event, marketplace, blockChain, chainId)
  }

  for (const event of dealCreated) {
    await manageDealUpdated(event, marketplace, blockChain, chainId)
  }

  for (const event of addedBalance) {
    await manageDealUpdated(event, marketplace, blockChain, chainId)
  }

  await lastReadBlockCollection.updateOne({block: lastReadBlock!.block, chainId: chainId}, {$set: {block: blockToRead}}, {upsert: true})
}

async function start() {
  await createRelationsBetweenTables()
  await resetMongoDB()
  try {
    const chains: any[] = Object.values(validChains)
    for (const chain of chains) {
      const sdk = new Sdk({chain: chain})
      await getPastEvents(new EventsHandler(sdk), new Blockchain(sdk), chain.id)
    }
  } catch (e) {
    console.log("Error", e)
  }
}

start()
  .then(() => {
    console.log("Past events gotten")
  })

/*
console.log("Start getting new events")

setInterval(async () => {
  try {
    const chains: any[] = Object.values(validChains)
    for (const chain of chains) {
      const sdk = new Sdk({chain: chain})
      await getEvents(new EventsHandler(sdk), new Blockchain(sdk), new Marketplace(sdk), chain.id)
    }
  } catch (e) {
    console.log("Error", e)
  }
}, 60000)*/
