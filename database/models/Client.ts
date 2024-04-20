import {DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../database"
import {Chain} from "./Chain"

export class Client extends Model<InferAttributes<Client>, InferCreationAttributes<Client>> {
  declare account: string
  declare chainId: ForeignKey<Chain["chainId"]>
}

Client.init({
  account: {type: DataTypes.STRING, primaryKey: true},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})