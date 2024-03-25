import {
  DataTypes, InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"
import {sequelize} from "../database"

export class Resource extends Model<InferAttributes<Resource>, InferCreationAttributes<Resource>> {
  declare id: string
  declare owner: string
  declare encryptedData: string
  declare encryptedSharedKey: string
  declare network: string
}

Resource.init({
  id: {type: DataTypes.BIGINT, primaryKey: true},
  owner: DataTypes.STRING,
  encryptedData: DataTypes.STRING(500),
  encryptedSharedKey: DataTypes.STRING(500),
  network: DataTypes.STRING
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})