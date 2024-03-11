// @ts-ignore
import {Sdk, MarketplaceViewer, Resources, Encryption, validChains, EventHandler} from 'media-sdk';
import {resourcesNotMatchingDeal} from "./utils/resources";
import {DealsController} from "./database/controllers/dealsController";
import {ResourcesController} from "./database/controllers/resourcesController";
import {resetDB} from "./database/utils";
import {OffersController} from "./database/controllers/offersController";
import {z} from "zod";

require('dotenv').config()

const init = async (chain: any) => {
    let sdkInstance = new Sdk({privateKey: process.env.PRIVATE_KEY!, chain: chain})

    let marketplaceViewer: MarketplaceViewer = new MarketplaceViewer(sdkInstance);
    let resourcesInstance: Resources = new Resources(sdkInstance);

    let resources = await resourcesInstance.getAllResourcesPaginating({address: process.env.userAddress, start: 0, end: 10})

    console.log("Resources", resources)

    let deals = await marketplaceViewer.getAllDealsPaginating({
        marketplaceId: 1,
        address: process.env.userAddress,
        isProvider: true
    })

    console.log("Deals", deals)


    let offers = await marketplaceViewer.getAllOffersPaginating({marketplaceId: 1, start: 0, steps: 10})

    console.log("Offers", offers)

    /*if(deals[0].length !== 0 && resources.length !== 0) {
        let resourcesWithoutDeal = resourcesNotMatchingDeal(resources.map((resource: any) => resource.id), deals.map((deal: any) => deal.resourceId))
        resources[0] = resources[0].filter((resource: any) => !resourcesWithoutDeal.includes(resource.id))
        for (const resource of resources[0]) {
            let attr = JSON.parse(resource.encryptedData)
            let decryptedSharedKey = await Encryption.ethSigDecrypt(
                resource.encryptedSharedKey,
                process.env.PRIVATE_KEY
            );

            let decrypted = await Encryption.decrypt(
                decryptedSharedKey,
                attr.iv,
                attr.tag,
                attr.encryptedData
            );

            let data = JSON.parse(decrypted)

            console.log("Resource data", data)

            try{
                await ResourcesController.upsertResource({id: resource.id, owner: resource.owner, ...data})
            }catch (e) {
                console.log("Error for resource", resource.id, e)
            }

        }
    }

    if(deals[0].length !== 0) {
        deals[0] = deals[0].filter((deal: any) => deal.status.active == true)
        for (const deal of deals[0]) {
            try{
                DealsController.parseDealMetadata(deal.terms.metadata)
                await DealsController.upsertDeal(DealsController.formatDeal(deal))
                console.log("Deal Correct", deal)
            } catch (e: any) {
                if (e instanceof z.ZodError) {
                    console.log("Deal Id: ", deal.id)
                    //console.error("Metadata Validation failed!\n", "Expected: ", DealsMetadataType.keyof()._def.values, " Got: ", deal.metadata);
                } else {
                    console.log("Deal Id: ", deal.id)
                    console.error("Unknown error", e.message, "With deal", deal);
                }
            }
        }
    }





    for (const offer of offers) {
        try{
            OffersController.parseOffer(offer.terms.metadata)
            await OffersController.upsertOffer(OffersController.formatOffer(offer))
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                console.log("Offer Id: ", offer.id)
                //console.error("Metadata Validation failed!\n", "Expected: ", OffersMetadataType.keyof()._def.values, " Got: ", offer.terms.metadata);
            } else {
                console.log("Offer Id: ", offer.id)
                console.error("Unknown error", e.message, "With offer", offer);
            }
        }
    }



    console.log("Deals from db", await DealsController.getDeals())*/
}

async function start() {
    const validChainKeys = Object.keys(validChains)
    await resetDB()
    try{
        for (const chain of validChainKeys) {
            await init(validChains[chain])
            console.log("Initialized on chain: ", validChains[chain].network)
        }
    } catch (e){
        console.log("Error", e)
    }
}

start()
