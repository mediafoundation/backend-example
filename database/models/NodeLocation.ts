import {sequelize} from "../database"
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize"

export class NodeLocation extends Model<InferAttributes<NodeLocation>, InferCreationAttributes<NodeLocation>> {
  declare id: CreationOptional<number>
  declare location: string
}

NodeLocation.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  location: {type: DataTypes.STRING},
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})