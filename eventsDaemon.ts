import { Blockchain, EventsHandler, http, Marketplace, Sdk, validChains } from "media-sdk"
import { lastReadBlockCollection } from "./database/database"
import { EventsController } from "./database/controllers/eventsController"
import { createRelationsBetweenTables, resetMongoDB } from "./database/utils"
import EventsUtils from "./utils/events"
import { httpNetworks } from "./networks"

const BATCH_SIZE = 1000n

const marketplaceGenesisBlock: { [index: number]: bigint } = {
  11155111: 6817833n,
  84532: 16170075n
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function createSdk(chain: any) {
  return new Sdk({ chain: chain, transport: [http(httpNetworks![chain.name][0])] })
}

async function updateEvents(events: any[], blockChain: Blockchain, chainId: number) {
  for (const event of events) {
    const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
    await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
  }
}

async function getEventsInRange(eventsHandler: EventsHandler, blockChain: Blockchain, chainId: number, fromBlock: bigint, toBlock: bigint) {
  const events = await eventsHandler.getMarketplacePastEvents({ eventName: undefined, fromBlock, toBlock })
  await updateEvents(events, blockChain, chainId)
}

async function getPastEvents(eventsHandler: EventsHandler, blockChain: Blockchain, chainId: number) {
  console.log("Getting past events on chain:", chainId)
  const lastBlockOnDb = await lastReadBlockCollection.findOne({ chainId: chainId })
  let blockToRead = lastBlockOnDb ? BigInt(lastBlockOnDb.block) : marketplaceGenesisBlock[chainId]

  const currentBlock = await blockChain.getBlockNumber()
  console.log("Current block", currentBlock, "on chain", chainId)

  while (blockToRead + BATCH_SIZE < currentBlock) {
    try {
      await getEventsInRange(eventsHandler, blockChain, chainId, blockToRead, blockToRead + BATCH_SIZE)
      await lastReadBlockCollection.updateOne({ block: blockToRead, chainId: chainId }, { $set: { block: blockToRead + BATCH_SIZE } }, { upsert: true })
      blockToRead += BATCH_SIZE
    } catch (e) {
      console.log(e)
    }
    await delay(1000)
  }

  try {
    await getEventsInRange(eventsHandler, blockChain, chainId, blockToRead, currentBlock)
    await lastReadBlockCollection.updateOne({ block: blockToRead, chainId: chainId }, { $set: { block: currentBlock } }, { upsert: true })
  } catch (e) {
    console.log(e)
  }

  console.log("Finish getting past events on chain:", chainId)
}

async function getEvents(eventsHandler: EventsHandler, blockChain: Blockchain, marketplace: Marketplace, chainId: number) {
  const lastReadBlock = await lastReadBlockCollection.findOne({ chainId: chainId })
  const blockToRead = await blockChain.getBlockNumber()

  console.log("Current block", blockToRead, "on chain", chainId)
  console.log(`Getting events on blocks: ${lastReadBlock!.block + 1} - ${blockToRead}`)
  if (blockToRead >= BigInt(lastReadBlock!.block) + 1n) {
    const events = await eventsHandler.getMarketplacePastEvents({
      eventName: undefined,
      fromBlock: BigInt(lastReadBlock!.block) + 1n,
      toBlock: blockToRead
    })

    for (const event of events) {
      console.log(event.eventName, event)
      await EventsUtils.manageDealUpdated(event, marketplace, blockChain, chainId)
    }

    await lastReadBlockCollection.updateOne({ block: lastReadBlock!.block, chainId: chainId }, { $set: { block: blockToRead } }, { upsert: true })
  }
}

async function start() {
  await createRelationsBetweenTables()
  await resetMongoDB()
  try {
    const chains: any[] = Object.values(validChains)
    for (const chain of chains) {
      const sdk = createSdk(chain)
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
          const sdk = createSdk(chain)
          await getEvents(new EventsHandler(sdk), new Blockchain(sdk), new Marketplace(sdk), chain.id)
        }
      } catch (e) {
        console.log("Error", e)
      }
    }, 60000 * 5) // Every 5 minutes
  })