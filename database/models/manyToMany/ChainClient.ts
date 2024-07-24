import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Chain} from "../Chain"
import {Client} from "../Clients/Client"
import {sequelize} from "../../database"

export class ChainClient extends Model<InferAttributes<ChainClient>, InferCreationAttributes<ChainClient>> {
  declare id: CreationOptional<number>
  declare chainId: ForeignKey<Chain["chainId"]>
  declare client: ForeignKey<Client["account"]>
}

ChainClient.init({
  id: {type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true}
}, {
  sequelize,
  timestamps: false
})