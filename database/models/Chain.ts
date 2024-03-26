import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {sequelize} from "../database"

export class Chain extends Model<InferAttributes<Chain>, InferCreationAttributes<Chain>> {
  declare chainId: number
  declare name: string
}

Chain.init({
  chainId: {primaryKey: true, type: DataTypes.BIGINT},
  name: DataTypes.STRING
}, {
  sequelize,
  freezeTableName: true,
  timestamps: false
})