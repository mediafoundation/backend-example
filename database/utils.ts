import {sequelize} from "./database";
import {Client} from "./models/Client";
import {Provider} from "./models/Provider";
import {Resource} from "./models/Resource";
import {DealsMetadata} from "./models/deals/DealsMetadata";
import {Deal} from "./models/deals/Deal";
import {DealsBandwidthLimit} from "./models/deals/DealsBandwidthLimit";
import {DealsNodeLocations} from "./models/deals/DealsNodeLocations";
import {DealsMetadataNodeLocations} from "./models/deals/DealsMetadataNodeLocations";
import {Offer} from "./models/offers/Offer";
import {OffersMetadata} from "./models/offers/OffersMetadata";
import {OffersBandwidthLimit} from "./models/offers/OffersBandwidthLimit";
import {OffersNodeLocations} from "./models/offers/OffersNodeLocations";
import {OffersMetadataNodeLocations} from "./models/offers/OffersMetadataNodeLocations";

const resetDB = async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    await Client.sync({force: true});
    await Provider.sync({force: true});
    await Resource.sync({force: true});

    // Deals
    await Deal.sync({force: true});
    await DealsMetadata.sync({force: true});
    await DealsBandwidthLimit.sync({force: true});
    await DealsNodeLocations.sync({force: true});
    await DealsMetadataNodeLocations.sync({force: true});

    // Offers
    await Offer.sync({force: true});
    await OffersMetadata.sync({force: true});
    await OffersBandwidthLimit.sync({force: true});
    await OffersNodeLocations.sync({force: true});
    await OffersMetadataNodeLocations.sync({force: true});

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
}

export {resetDB}