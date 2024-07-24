import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Client} from "../Clients/Client"
import {Provider} from "../Providers/Provider"
import {sequelize} from "../../database"

export class ProviderClient extends Model<InferAttributes<ProviderClient>, InferCreationAttributes<ProviderClient>> {
  declare id: CreationOptional<number>
  declare client: ForeignKey<Client["account"]>
  declare provider: ForeignKey<Provider["account"]>
}

ProviderClient.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true}
}, {
  sequelize,
  timestamps: false
})