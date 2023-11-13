// @ts-ignore
import { initSdk } from 'media-sdk';
require('dotenv').config()

const init = async () => {
    console.log(process.env.PRIVATE_KEY)
    initSdk(process.env.PRIVATE_KEY, {
        id: 1,
        name: "Ethereum Mainnet",
        network: "Ethereum Mainnet",
        nativeCurrency: {
            symbol: "ETH",
            name: "ETH",
        }
    }, process.env.marketplaceId, process.env.RPC_URL);
}

init()
.then(() => {
    console.log("Initialized");
})
.catch((err) => {
    console.log("Error initializing", err);
})