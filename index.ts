// @ts-ignore
import { initSdk, MarketplaceViewer } from 'media-sdk';
require('dotenv').config()

const init = async () => {
    initSdk(process.env.PRIVATE_KEY, {
        id: process.env.chainId,
        name: process.env.chainName,
        network: process.env.chainNetwork,
        nativeCurrency: {
            symbol: process.env.chainSymbol,
            name: process.env.symbolName,
        }
    }, process.env.marketplaceId, process.env.RPC_URL);

    let marketplaceViewer: MarketplaceViewer = new MarketplaceViewer();

    let deals = await marketplaceViewer.getDeals(0, 10, true)

    console.log(deals)
}

init()
.then(() => {
    console.log("Initialized");
})
.catch((err) => {
    console.log("Error initializing", err);
})