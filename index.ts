// @ts-ignore
import {initSdk, MarketplaceViewer, Resources, Encryption} from 'media-sdk';
import {resourcesNotMatchingDeal} from "./utils/resources";
import {DealsController} from "./database/controllers/dealsController";
import {ResourcesController} from "./database/controllers/resourcesController";
import {resetDB} from "./database/utils";
import {OffersController} from "./database/controllers/offersController";
import {z} from "zod";
import {OffersMetadataType} from "./database/models/offers/OffersMetadata";
import {DealsMetadataType} from "./database/models/deals/DealsMetadata";

require('dotenv').config()

const init = async () => {
    initSdk({privateKey: process.env.PRIVATE_KEY!})

    let marketplaceViewer: MarketplaceViewer = new MarketplaceViewer();
    let resourcesInstance: Resources = new Resources();

    let resources = await resourcesInstance.getPaginatedResources({address: process.env.userAddress, start: 0, end: 10})
    let deals = await marketplaceViewer.getPaginatedDeals({
        marketPlaceId: 1,
        address: process.env.userAddress,
        isProvider: true
    })

    let offers = await marketplaceViewer.getAllOffersPaginating({marketPlaceId: 1, start: 0, steps: 10})

    deals[0] = deals[0].filter((deal: any) => deal.status.active == true)

    let resourcesWithoutDeal = resourcesNotMatchingDeal(resources.map((resource: any) => resource.id), deals.map((deal: any) => deal.resourceId))

    resources[0] = resources[0].filter((resource: any) => !resourcesWithoutDeal.includes(resource.id))

    await resetDB()

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

        await ResourcesController.upsertResource({id: resource.id, owner: resource.owner, ...data})
    }

    for (const offer of offers) {
        try{
            OffersController.parseOffer(offer.metadata)
            await OffersController.upsertOffer(OffersController.formatOffer(offer))
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                console.log("Offer Id: ", offer.id)
                console.error("Metadata Validation failed!\n", "Expected: ", OffersMetadataType.keyof()._def.values, " Got: ", offer.metadata);
            } else {
                console.log("Offer Id: ", offer.id)
                console.error("Unknown error", e);
            }
        }
    }

    for (const deal of deals[0]) {
        try{
            DealsController.parseDealMetadata(deal.metadata)
            await DealsController.upsertDeal(DealsController.formatDeal(deal))
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                console.log("Deal Id: ", deal.id)
                console.error("Metadata Validation failed!\n", "Expected: ", DealsMetadataType.keyof()._def.values, " Got: ", deal.metadata);
            } else {
                console.log("Deal Id: ", deal.id)
                console.error("Unknown error", e);
            }
        }
    }

}

init()
    .then(() => {
        console.log("Initialized");
    })
    .catch((err) => {
        console.log("Error initializing", err);
    })