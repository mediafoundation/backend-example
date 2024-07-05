import {Client} from "./models/Client"
import {Resource} from "./models/Resource"
import {Deal} from "./models/deals/Deal"
import {connectToMongodb, eventsCollection, lastReadBlockCollection, providersCollection, sequelize} from "./database"
import {NodeLocation} from "./models/NodeLocation"
import {BandwidthLimit} from "./models/BandwidthLimit"
import {Provider} from "./models/Provider"
import {DealMetadata} from "./models/deals/DealsMetadata"
import {Offer} from "./models/offers/Offer"
import {OfferMetadata} from "./models/offers/OffersMetadata"
import {Chain} from "./models/Chain"
import {ChainClient} from "./models/manyToMany/ChainClient"
import {ChainProvider} from "./models/manyToMany/ChainProvider"
import {ProviderClient} from "./models/manyToMany/ProviderClient"
import {DealNodeLocation} from "./models/manyToMany/DealNodeLocation"
import {OfferNodeLocation} from "./models/manyToMany/OfferNodeLocation"

const resetSequelizeDB = async () => {
  await createRelationsBetweenTables()
  await connectToMongodb()
  await providersCollection.drop()
  await sequelize.sync({force: true})
}

const resetMongoDB = async () => {
  await connectToMongodb()

  await eventsCollection.drop()
  await lastReadBlockCollection.drop()
}

const createRelationsBetweenTables = async () => {
  
  Resource.belongsTo(Chain, {
    as: "Chain",
    foreignKey: "chainId"
  })

  Provider.belongsToMany(Chain, {
    through: ChainProvider,
    foreignKey: "provider",
    otherKey: "chainId",
    timestamps: false
  })

  Provider.belongsToMany(Client, {
    through: ProviderClient,
    foreignKey: "provider",
    otherKey: "client",
    timestamps: false
  })

  Provider.hasMany(Deal, {
    sourceKey: "account",
    foreignKey: "provider"
  })

  Provider.hasMany(Offer, {
    sourceKey: "account",
    foreignKey: "provider"
  })

  Client.belongsToMany(Chain, {
    through: ChainClient,
    foreignKey: "client",
    otherKey: "chainId",
    timestamps: false
  })

  Deal.belongsTo(Chain, {
    foreignKey: "chainId",
    as: "Chain"
  })

  Deal.belongsTo(Resource, {
    foreignKey: "resourceId",
    as: "Resource",
    onDelete: "SET NULL"
  })

  Deal.belongsTo(Client, {
    foreignKey: "client"
  })

  Deal.belongsTo(Provider, {
    foreignKey: "provider"
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
    foreignKey: "dealMetadataId"
  })

  Deal.belongsToMany(NodeLocation, {
    through: DealNodeLocation,
    foreignKey: "dealId",
    otherKey: "location",
    timestamps: false
  })

  OfferMetadata.hasOne(BandwidthLimit, {
    onDelete: "CASCADE",
    as: "BandwidthLimit",
    sourceKey: "id",
    foreignKey: "offerMetadataId"
  })

  Offer.hasOne(OfferMetadata, {
    onDelete: "CASCADE",
    as: "Metadata",
    sourceKey: "id",
    foreignKey: "offerId"
  })

  Offer.belongsTo(Provider, {
    foreignKey: "provider",
    as: "Provider"
  })
  
  Offer.belongsTo(Chain, {
    foreignKey: "chainId",
    as: "Chain"
  })

  Offer.belongsToMany(NodeLocation, {
    through: OfferNodeLocation,
    foreignKey: "offerId",
    otherKey: "location",
    timestamps: false
  })

}

export {resetSequelizeDB, createRelationsBetweenTables, resetMongoDB}