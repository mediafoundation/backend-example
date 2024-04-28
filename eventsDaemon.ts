import {Blockchain, EventsHandler, Sdk, validChains} from "media-sdk"
import {lastReadBlockCollection} from "./database/database"
import {EventsController} from "./database/controllers/eventsController"
import {createRelationsBetweenTables} from "./database/utils"

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) )
}

async function getEventsByBatches(eventsHandler: EventsHandler, blockChain: Blockchain, chainId: number) {
  const lastBlockOnDb = await lastReadBlockCollection.findOne()
  let blockToRead = lastBlockOnDb ? BigInt(lastBlockOnDb.block) : 5284652n

  const currentBlock = await blockChain.getBlockNumber()

  //await lastReadBlockCollection.insertOne(currentBlock)

  while (blockToRead < currentBlock) {
    try {
      const events = await eventsHandler.getMarketplacePastEvents({eventName: undefined, fromBlock: blockToRead, toBlock: blockToRead + 1000n})
      if(events.length !== 0){
        console.log(events)
      }
      blockToRead = blockToRead + 1000n
      for (const event of events) {
        const blockTimestamp = await blockChain.getBlockTimestamp(event.blockNumber)
        await EventsController.upsertEvent(EventsController.formatEvent(event), chainId, Number(blockTimestamp.timestamp))
      }
    } catch (e) {
      console.log(e)
    }

    await delay(1000)
  }
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
    await getEventsByBatches(new EventsHandler(sdk), new Blockchain(sdk), 11155111)

  } catch (e) {
    console.log("Error", e)
  }
}

start()
