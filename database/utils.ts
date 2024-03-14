import {Client} from "./models/Client";
import {Resource} from "./models/Resource";
import {Deal} from "./models/deals/Deal";
import {sequelize} from "./database";
import {NodeLocation} from "./models/NodeLocation";
import {BandwidthLimit} from "./models/BandwidthLimit";
import {Provider} from "./models/Provider";
import {DealMetadata} from "./models/deals/DealsMetadata";

const resetDB = async () => {

    await createRelationsBetweenTables()

    //await sequelize.truncate({cascade: true})

    await sequelize.sync({force: true})


}

const createRelationsBetweenTables = async () => {

    //Deals
    Resource.hasMany(Deal, {
        as: 'Deals',
        foreignKey: 'resourceId'
    });
    //Deal.belongsTo(Resource);

    /*Client.hasMany(Deal, {
        as: 'Deals',
        foreignKey: 'clientId'
    })*/
    //Deal.belongsTo(Client, {})

    Deal.belongsTo(Resource, {
        foreignKey: 'resourceId',
        as: 'Resource' // Alias opcional para la relación
    });

    Deal.belongsTo(Client, {
        foreignKey: 'client',
        as: 'Client' // Alias opcional para la relación
    });

    Deal.belongsTo(Provider, {
        foreignKey: 'provider',
        as: 'Provider' // Alias opcional para la relación
    });

    Deal.hasOne(DealMetadata, {
        onDelete: 'CASCADE',
        as: 'Metadata',
        sourceKey: 'id',
        foreignKey: 'dealId'
    })

    Deal.hasOne(BandwidthLimit, {
        onDelete: 'CASCADE',
        as: 'BandwidthLimit',
        sourceKey: 'id',
        foreignKey: 'dealId'
    })

    Deal.belongsToMany(NodeLocation, {
        through: 'DealNodeLocation',
        foreignKey: 'dealId',
        otherKey: 'nodeLocationId',
    });

    //BandwidthLimit.belongsTo(Deal);

    /*Deal.belongsToMany(NodeLocation, {
        through: 'DealsNodeLocations'
    });

    NodeLocation.belongsToMany(Deal, {through: 'DealsNodeLocations'});
    Deal.belongsToMany(NodeLocation, {through: 'DealsNodeLocations'});*/


    //Offers

    /*Offer.hasMany(Deal, {
        as: 'Deals',
        foreignKey: 'offerId'
    });*/

    /*Offer.hasOne(OffersMetadata, {onDelete: 'CASCADE'});
    OffersMetadata.belongsTo(Offer);

    Offer.hasOne(BandwidthLimit, {onDelete: 'CASCADE'});
    BandwidthLimit.belongsTo(Offer);

    Offer.belongsToMany(NodeLocation, {through: 'OffersNodeLocations'});
    NodeLocation.belongsToMany(Offer, {through: 'OffersNodeLocations'});

    Provider.hasMany(Offer);
    Offer.belongsTo(Provider);*/

}

export {resetDB, createRelationsBetweenTables}