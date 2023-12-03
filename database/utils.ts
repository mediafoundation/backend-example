import {sequelize} from "./database";
import {Client} from "./models/Client";
import {Provider} from "./models/Provider";
import {Resource} from "./models/Resource";
import {DealsMetadata} from "./models/DealsMetadata";
import {Deal} from "./models/Deal";
import {BandwidthLimit} from "./models/DealsBandwidthLimit";
import {DealsNodeLocations} from "./models/DealsNodeLocations";
import {DealsMetadataNodeLocations} from "./models/DealsMetadataNodeLocations";

const resetDB = async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    await Deal.sync({force: true});
    await Client.sync({force: true});
    await Provider.sync({force: true});
    await Resource.sync({force: true});
    await DealsMetadata.sync({force: true});
    await BandwidthLimit.sync({force: true});
    await DealsNodeLocations.sync({force: true});
    await DealsMetadataNodeLocations.sync({force: true});

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
}

export {resetDB}