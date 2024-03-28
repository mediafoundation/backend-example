import {
  CreationOptional,
  DataTypes, ForeignKey, InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"
import {sequelize} from "../database"
import {Chain} from "./Chain"

export class Resource extends Model<InferAttributes<Resource>, InferCreationAttributes<Resource>> {
  declare id: CreationOptional<number>
  declare resourceId: number
  declare owner: string
  declare encryptedData: string
  declare encryptedSharedKey: string
  declare chainId: ForeignKey<Chain["chainId"]>
}

Resource.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  resourceId: DataTypes.BIGINT,
  owner: DataTypes.STRING,
  encryptedData: DataTypes.STRING(500),
  encryptedSharedKey: DataTypes.STRING(500),
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})