import {
  CreationOptional,
  DataTypes,
  ForeignKey, HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"
import {sequelize} from "../../database"
import {Offer} from "./Offer"
import {BandwidthLimit} from "../BandwidthLimit"

export class OfferMetadata extends Model<InferAttributes<OfferMetadata>, InferCreationAttributes<OfferMetadata>> {
  declare id: CreationOptional<number>
  declare offerId: ForeignKey<Offer["id"]>
  declare type: string
  declare label: string
  declare autoSsl: boolean
  declare burstSpeed: number
  declare customCnames: boolean
  declare apiEndpoint: string
  
  declare getBandwidthLimit: HasOneGetAssociationMixin<BandwidthLimit>
  declare createBandwidthLimit: HasOneCreateAssociationMixin<BandwidthLimit>
}

OfferMetadata.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  type: DataTypes.STRING,
  label: DataTypes.STRING,
  autoSsl: DataTypes.BOOLEAN,
  burstSpeed: DataTypes.INTEGER,
  apiEndpoint: DataTypes.STRING,
}, {
  sequelize,
  timestamps: false,
})