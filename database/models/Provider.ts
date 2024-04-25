import {
  DataTypes,
  HasManyCountAssociationsMixin, InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"
import {sequelize} from "../database"

export class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
  declare account: string

  declare countDeals: HasManyCountAssociationsMixin
  declare countOffers: HasManyCountAssociationsMixin
}

Provider.init({
  account: {type: DataTypes.STRING, primaryKey: true},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})