import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../../database"
import {array, boolean, number, object, string, z} from "zod"
import {Deal} from "./Deal"

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

export const DealsMetadataType = z.object({
  type: string(),
  label: string(),
  bandwidthLimit: object({
    amount: number(),
    period: string(),
    unit: string()
  }),
  autoSsl: boolean(),
  burstSpeed: number(),
  nodeLocations: array(string()),
  apiEndpoint: string(),
  customCnames: boolean()
})