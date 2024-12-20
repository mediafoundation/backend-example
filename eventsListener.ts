import { wssNetworks } from "./networks"
import {Blockchain, EventsHandler, Marketplace, RatingSystem, Sdk, validChains, webSocket} from "media-sdk"
import EventsUtils from "./utils/events"
import { createRelationsBetweenTables } from "./database/utils"

const RECONNECT_INTERVAL = 3600000 // 1 hour in milliseconds

async function initializeListeners() {
  await createRelationsBetweenTables()
  console.log("Db relations created")

  const chains: any[] = Object.values(validChains)
  for (const chain of chains) {
    let sdk = createSdk(chain)
    let blockchain = new Blockchain(sdk)
    let marketplace = new Marketplace(sdk)
    let eventsListener = new EventsHandler(sdk)
    let ratingService = new RatingSystem(sdk) // Assuming you have a RatingService

    setupEventListeners(eventsListener, marketplace, blockchain, ratingService, chain.id)

    setInterval(() => {
      console.log(`Reconnecting to ${chain.name}...`)
      sdk = createSdk(chain)
      blockchain = new Blockchain(sdk)
      marketplace = new Marketplace(sdk)
      eventsListener = new EventsHandler(sdk)
      ratingService = new RatingSystem(sdk)
      setupEventListeners(eventsListener, marketplace, blockchain, ratingService, chain.id)
    }, RECONNECT_INTERVAL)
  }
}

function createSdk(chain: any) {
  return new Sdk({
    chain: chain,
    transport: [webSocket(wssNetworks[chain.name][0], {
      reconnect: {
        delay: 500, // Reduce delay between reconnection attempts
        attempts: 20 // Increase the number of reconnection attempts
      },
      keepAlive: {
        interval: 5000 // Send keep-alive messages more frequently
      },
      timeout: 5000, // Reduce the timeout duration
      retryCount: 10, // Increase the number of retries
      retryDelay: 5000 // Reduce the delay between retries
    })]
  })
}

function setupEventListeners(eventsListener: EventsHandler, marketplace: Marketplace, blockchain: Blockchain, ratingService: any, chainId: string) {
  const marketplaceEvents = [
    { name: "DealCreated", handler: EventsUtils.manageDealUpdated },
    { name: "DealAccepted", handler: EventsUtils.manageDealUpdated },
    { name: "DealCancelled", handler: EventsUtils.manageDealUpdated },
    { name: "OfferCreated", handler: EventsUtils.manageOfferUpdated },
    { name: "OfferUpdated", handler: EventsUtils.manageOfferUpdated },
    { name: "OfferDeleted", handler: EventsUtils.manageOfferUpdated },
  ]

  const ratingEvents = [
    { name: "RatedProvider", handler: EventsUtils.manageRatingUpdated },
    { name: "RemovedRating", handler: EventsUtils.manageRatingUpdated }
  ]

  for (const event of marketplaceEvents) {
    eventsListener.listenForMarketplaceEvent({
      eventName: event.name,
      onError: (error: any) => {
        console.log("Error getting marketplace event", error)
      },
      callback: async (event: any) => {
        console.log(event)
        for (const eventElement of event) {
          await event.handler(eventElement, marketplace, blockchain, chainId)
        }
      }
    }).then(() => {})
  }

  for (const event of ratingEvents) {
    eventsListener.listenForRatingSystemEvent({
      eventName: event.name,
      onError: (error: any) => {
        console.log("Error getting rating event", error)
      },
      callback: async (event: any) => {
        console.log(event)
        for (const eventElement of event) {
          await event.handler(eventElement, ratingService, blockchain, chainId)
        }
      }
    }).then(() => {})
  }
}

initializeListeners()