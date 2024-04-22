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
import {Deal} from "./Deal"
import {BandwidthLimit} from "../BandwidthLimit"

export class DealMetadata extends Model<
  InferAttributes<DealMetadata>,
  InferCreationAttributes<DealMetadata>
>{
  declare id: CreationOptional<number>
  declare dealId: ForeignKey<Deal["id"]>
  declare type: string
  declare label: string
  declare autoSsl: boolean
  declare burstSpeed: number
  declare apiEndpoint: string
  declare customCnames: boolean
  
  declare getBandwidthLimit: HasOneGetAssociationMixin<BandwidthLimit>
  declare createBandwidthLimit: HasOneCreateAssociationMixin<BandwidthLimit>
}

DealMetadata.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  type: DataTypes.STRING,
  label: DataTypes.STRING,
  autoSsl: DataTypes.BOOLEAN,
  burstSpeed: DataTypes.INTEGER,
  apiEndpoint: DataTypes.STRING,
  customCnames: DataTypes.BOOLEAN
}, {
  sequelize,
  timestamps: false,
})