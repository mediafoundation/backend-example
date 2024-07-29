import {wssNetworks} from "./networks"
import {EventsHandler, Sdk, validChains} from "media-sdk"

const chains: any[] = Object.values(validChains)
for (const chain of chains) {
  const sdk = new Sdk({chain: chain, transport: wssNetworks[chain.name]})
  const eventsListener = new EventsHandler(sdk)

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealCreated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealAccepted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    "eventName": "DealUpdated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {
    })

  eventsListener.listenForMarketplaceEvent({
    eventName: "DealDeleted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {})

  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferCreated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {})
  
  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferUpdated",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {})
  
  eventsListener.listenForMarketplaceEvent({
    eventName: "OfferDeleted",
    onError: (error: any) => {
      console.log(error)
    },
    callback: (event: any) => {
      console.log(event)
    }
  })
    .then(() => {})


}