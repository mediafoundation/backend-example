import {Blockchain, EventsHandler, Sdk, validChains} from "media-sdk"
import {lastReadBlockCollection} from "./database/database"
import {EventsController} from "./database/controllers/eventsController"
import {createRelationsBetweenTables} from "./database/utils"

const BATCH_SIZE = 1000n

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) )
}

async function getPastEvents(eventsHandler: EventsHandler, blockChain: Blockchain, chainId: number) {
  const lastBlockOnDb = await lastReadBlockCollection.findOne()
  let blockToRead = lastBlockOnDb ? BigInt(lastBlockOnDb.block) : 5284652n

  const currentBlock = await blockChain.getBlockNumber()

  console.log("Current block", currentBlock)

  //await lastReadBlockCollection.insertOne(currentBlock)

  while (blockToRead < currentBlock) {
    try {
      const events = []

      events.push(...await eventsHandler.getResourcesPastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: blockToRead + BATCH_SIZE}))
      events.push(...await eventsHandler.getMarketplacePastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: blockToRead + BATCH_SIZE}))

      for (const event of events) {
        const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
        await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
      }

      await lastReadBlockCollection.updateOne({block: blockToRead}, {$set: {block: blockToRead + BATCH_SIZE}}, {upsert: true})
      blockToRead = blockToRead + BATCH_SIZE
    } catch (e) {
      console.log(e)
    }

    await delay(1000)
  }

  console.log("Finish")
}

async function start() {
  createRelationsBetweenTables()
    .then(() => {
      console.log("Associations created")
    })
  try {
    /*const chains: any[] = Object.values(validChains)
    for (const chain of chains) {
      const sdk = new Sdk({chain: chain})
      await getEventsByBatches(new EventsHandler(sdk), new Blockchain(sdk))
    }*/

    const sdk = new Sdk({chain: validChains["11155111"]})
    await getPastEvents(new EventsHandler(sdk), new Blockchain(sdk), 11155111)

  } catch (e) {
    console.log("Error", e)
  }
}

start()
