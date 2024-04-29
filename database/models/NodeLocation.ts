import {sequelize} from "../database"
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"

export class NodeLocation extends Model<InferAttributes<NodeLocation>, InferCreationAttributes<NodeLocation>> {
  declare location: string
}

NodeLocation.init({
  location: {type: DataTypes.STRING, primaryKey: true},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})