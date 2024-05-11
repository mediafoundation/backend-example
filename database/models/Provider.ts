import {
  BelongsToManyCountAssociationsMixin,
  DataTypes,
  HasManyCountAssociationsMixin,
  InferCreationAttributes,
  Model,
  NonAttribute
} from "sequelize"
import {sequelize} from "../database"
import {Chain} from "./Chain"

interface ProviderAttributes {
  account: string,
  publicKey: string,
  Chains?: Chain[]
}

export class Provider extends Model<ProviderAttributes, InferCreationAttributes<Provider>> {
  declare account: string
  declare publicKey: string

  declare countDeals: HasManyCountAssociationsMixin
  declare countOffers: HasManyCountAssociationsMixin
  declare countClients: BelongsToManyCountAssociationsMixin

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