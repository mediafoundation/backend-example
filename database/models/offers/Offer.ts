import {
  BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, CreationOptional,
  DataTypes,
  ForeignKey, HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"
import {sequelize} from "../../database"
import {Provider} from "../Providers/Provider"
import {OfferMetadata} from "./OffersMetadata"
import {NodeLocation} from "../NodeLocation"
import {Chain} from "../Chain"

export class Offer extends Model<InferAttributes<Offer>, InferCreationAttributes<Offer>> {
  declare id: CreationOptional<number>
  declare offerId: number
  declare provider: ForeignKey<Provider["account"]>
  declare chainId: ForeignKey<Chain["chainId"]>
  declare publicKey: string
  declare maximumDeals: number
  declare autoAccept: boolean
  declare pricePerSecond: number
  declare minDealDuration: number
  declare billFullPeriods: boolean
  declare singlePeriodOnly: boolean

  declare getMetadata: HasOneGetAssociationMixin<OfferMetadata>
  declare createMetadata: HasOneCreateAssociationMixin<OfferMetadata>

  declare getNodeLocations: BelongsToManyGetAssociationsMixin<NodeLocation>
  declare createNodeLocation: BelongsToManyCreateAssociationMixin<NodeLocation>
}

Offer.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  offerId: DataTypes.BIGINT,
  publicKey: DataTypes.STRING,
  maximumDeals: DataTypes.BIGINT,
  autoAccept: DataTypes.BOOLEAN,
  pricePerSecond: DataTypes.BIGINT,
  minDealDuration: DataTypes.INTEGER,
  billFullPeriods: DataTypes.BOOLEAN,
  singlePeriodOnly: DataTypes.BOOLEAN,
}, {
  sequelize,
  timestamps: false,
  modelName: "Offer",
  freezeTableName: true
})