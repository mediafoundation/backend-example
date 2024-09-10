import {wssNetworks} from "./networks"
import {Blockchain, EventsHandler, Marketplace, Sdk, validChains, webSocket} from "media-sdk"
import {manageDealUpdated, manageOfferUpdated} from "./eventsDaemon"

const chains: any[] = Object.values(validChains)
for (const chain of chains) {
  const sdk = new Sdk({chain: chain, transport: [webSocket(wssNetworks[chain.id][0])]})
  const blockchain = new Blockchain(sdk)
  const marketplace = new Marketplace(sdk)
  const eventsListener = new EventsHandler(sdk)

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealCreated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await manageDealUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealAccepted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await manageDealUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    "eventName": "DealUpdated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await manageDealUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealDeleted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await manageDealUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})

  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferCreated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      console.log(event)
    }
  })
    .then(() => {})
  
  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferUpdated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async(event: any) => {
      await manageOfferUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})
  
  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferDeleted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async(event: any) => {
      await manageOfferUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})


}