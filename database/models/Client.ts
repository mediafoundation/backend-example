import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../database"
import {Chain} from "./Chain"

export class Client extends Model<InferAttributes<Client>, InferCreationAttributes<Client>> {
  declare id: CreationOptional<number>
  declare account: string
  declare chainId: ForeignKey<Chain["chainId"]>
}

Client.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  account: {type: DataTypes.STRING},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})