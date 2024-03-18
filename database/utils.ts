import {Client} from "./models/Client";
import {Resource} from "./models/Resource";
import {Deal} from "./models/deals/Deal";
import {sequelize} from "./database";
import {NodeLocation} from "./models/NodeLocation";
import {BandwidthLimit} from "./models/BandwidthLimit";
import {Provider} from "./models/Provider";
import {DealMetadata} from "./models/deals/DealsMetadata";
import {Offer} from "./models/offers/Offer";
import {OfferMetadata} from "./models/offers/OffersMetadata";

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
        timestamps: false
    });

    Offer.hasOne(BandwidthLimit, {
        onDelete: 'CASCADE',
        as: 'BandwidthLimit',
        sourceKey: 'id',
        foreignKey: 'offerId'
    })

    Offer.hasOne(OfferMetadata, {
        onDelete: 'CASCADE',
        as: 'Metadata',
        sourceKey: 'id',
        foreignKey: 'offerId'
    })

    Offer.belongsTo(Provider, {
        foreignKey: 'providerId',
        as: 'Provider'
    });

    Offer.belongsToMany(NodeLocation, {
        through: 'OfferNodeLocation',
        foreignKey: 'offerId',
        otherKey: 'nodeLocationId',
        timestamps: false
    });

}

export {resetDB, createRelationsBetweenTables}