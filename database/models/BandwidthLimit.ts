import {sequelize} from "../database"
import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {DealMetadata} from "./deals/DealsMetadata"
import {OfferMetadata} from "./offers/OffersMetadata"

export class BandwidthLimit extends Model<InferAttributes<BandwidthLimit>, InferCreationAttributes<BandwidthLimit>> {
  declare id: CreationOptional<number>
  declare dealMetadataId: CreationOptional<ForeignKey<DealMetadata["id"]>>
  declare offerId: CreationOptional<ForeignKey<OfferMetadata["id"]>>
  declare amount: number
  declare period: string
  declare unit: string
}

BandwidthLimit.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  amount: DataTypes.BIGINT,
  period: DataTypes.STRING,
  unit: DataTypes.STRING,
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})