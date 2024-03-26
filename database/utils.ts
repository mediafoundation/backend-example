import {Client} from "./models/Client"
import {Resource} from "./models/Resource"
import {Deal} from "./models/deals/Deal"
import {sequelize} from "./database"
import {NodeLocation} from "./models/NodeLocation"
import {BandwidthLimit} from "./models/BandwidthLimit"
import {Provider} from "./models/Provider"
import {DealMetadata} from "./models/deals/DealsMetadata"
import {Offer} from "./models/offers/Offer"
import {OfferMetadata} from "./models/offers/OffersMetadata"
import {Chain} from "./models/Chain"

const resetDB = async () => {

  await createRelationsBetweenTables()

  await sequelize.sync({force: true})
}

const createRelationsBetweenTables = async () => {
  
  Resource.hasMany(Deal, {
    as: "Deals",
    foreignKey: "resourceId"
  })

  Deal.belongsTo(Resource, {
    foreignKey: "resourceId",
    as: "Resource"
  })

  Deal.belongsTo(Client, {
    foreignKey: "client",
    as: "Client"
  })

  Deal.belongsTo(Provider, {
    foreignKey: "provider",
    as: "Provider"
  })
  
  Deal.belongsTo(Chain, {
    foreignKey: "chainId",
    as: "Chain"
  })

  Deal.hasOne(DealMetadata, {
    onDelete: "CASCADE",
    as: "Metadata",
    sourceKey: "id",
    foreignKey: "dealId"
  })

  DealMetadata.hasOne(BandwidthLimit, {
    onDelete: "CASCADE",
    as: "BandwidthLimit",
    sourceKey: "id",
    foreignKey: "metadataId"
  })

  Deal.belongsToMany(NodeLocation, {
    through: "DealNodeLocation",
    foreignKey: "dealId",
    otherKey: "nodeLocationId",
    timestamps: false
  })

  OfferMetadata.hasOne(BandwidthLimit, {
    onDelete: "CASCADE",
    as: "BandwidthLimit",
    sourceKey: "id",
    foreignKey: "offerId"
  })

  Offer.hasOne(OfferMetadata, {
    onDelete: "CASCADE",
    as: "Metadata",
    sourceKey: "id",
    foreignKey: "offerId"
  })

  Offer.belongsTo(Provider, {
    foreignKey: "providerId",
    as: "Provider"
  })

  Offer.belongsToMany(NodeLocation, {
    through: "OfferNodeLocation",
    foreignKey: "offerId",
    otherKey: "nodeLocationId",
    timestamps: false
  })

}

export {resetDB, createRelationsBetweenTables}