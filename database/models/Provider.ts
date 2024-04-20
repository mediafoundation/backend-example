import {DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../database"
import {Chain} from "./Chain"

export class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
  declare account: string
  declare chainId: ForeignKey<Chain["chainId"]>
}

Provider.init({
  account: {type: DataTypes.STRING, primaryKey: true},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})