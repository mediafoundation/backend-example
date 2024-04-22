import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Chain} from "../Chain"
import {sequelize} from "../../database"
import {Provider} from "../Provider"

export class ChainProvider extends Model<InferAttributes<ChainProvider>, InferCreationAttributes<ChainProvider>> {
  declare id: CreationOptional<number>
  declare chainId: ForeignKey<Chain["chainId"]>
  declare provider: ForeignKey<Provider["account"]>
}

ChainProvider.init({
  id: {type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true}
}, {
  sequelize,
  timestamps: false
})