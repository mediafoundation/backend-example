import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Client} from "../Client"
import {Provider} from "../Provider"
import {sequelize} from "../../database"

class ProviderClient extends Model<InferAttributes<ProviderClient>, InferCreationAttributes<ProviderClient>> {
  declare id: CreationOptional<number>
  declare client: ForeignKey<Client>
  declare provider: ForeignKey<Provider>
}

ProviderClient.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true}
}, {
  sequelize,
  timestamps: false
})