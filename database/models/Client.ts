import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../database"

export class Client extends Model<InferAttributes<Client>, InferCreationAttributes<Client>> {
  declare account: string
}

Client.init({
  account: {type: DataTypes.STRING, primaryKey: true},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})