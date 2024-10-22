import {wssNetworks} from "./networks"
import {Blockchain, EventsHandler, Marketplace, Sdk, validChains, webSocket} from "media-sdk"
import EventsUtils from "./utils/events"

const chains: any[] = Object.values(validChains)
for (const chain of chains) {
  const sdk = new Sdk({chain: chain, transport: [webSocket(wssNetworks[chain.name][0])]})
  const blockchain = new Blockchain(sdk)
  const marketplace = new Marketplace(sdk)
  const eventsListener = new EventsHandler(sdk)

  /*eventsListener.listenForResourcesEvent({
    eventName: "AddedResource",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await ResourcesController.upsertResource(ResourcesController.upsertResource())
    }
  })
    .then(() => {
    })*/

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealCreated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await EventsUtils.manageDealUpdated(event, marketplace, blockchain, chain.id)
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
      await EventsUtils.manageDealUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealCancelled",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await EventsUtils.manageDealUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})

  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferCreated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async (event: any) => {
      await EventsUtils.manageOfferUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})
  
  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferUpdated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async(event: any) => {
      await EventsUtils.manageOfferUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})
  
  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferDeleted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: async(event: any) => {
      await EventsUtils.manageOfferUpdated(event, marketplace, blockchain, chain.id)
    }
  })
    .then(() => {})


}