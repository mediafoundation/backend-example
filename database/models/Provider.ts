import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../database"
import {Chain} from "./Chain"

export class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
  declare id: CreationOptional<number>
  declare account: string
  declare chainId: ForeignKey<Chain["chainId"]>
}

Provider.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  account: {type: DataTypes.STRING},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})