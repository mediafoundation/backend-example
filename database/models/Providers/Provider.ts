import {
  BelongsToManyCountAssociationsMixin,
  DataTypes,
  HasManyCountAssociationsMixin, HasManyGetAssociationsMixin,
  InferCreationAttributes,
  Model,
  NonAttribute
} from "sequelize"
import {sequelize} from "../../database"
import {Chain} from "../Chain"
import {Client} from "../Clients/Client"
import {Rating} from "../Rating"

interface ProviderAttributes {
  account: string,
  publicKey: string,
  Chains?: number[]
  Ratings?: Rating[]
}

export class Provider extends Model<ProviderAttributes, InferCreationAttributes<Provider>> {
  declare account: string
  declare publicKey: string

  declare countDeals: HasManyCountAssociationsMixin
  declare countOffers: HasManyCountAssociationsMixin
  declare countClients: BelongsToManyCountAssociationsMixin

  declare getClients: HasManyGetAssociationsMixin<Client>

  declare Chains?: NonAttribute<Chain[] | number[] | undefined>
}

Provider.init({
  account: {type: DataTypes.STRING, primaryKey: true},
  publicKey: DataTypes.STRING
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})