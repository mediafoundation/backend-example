import {CreationOptional, DataTypes, ForeignKey, InferCreationAttributes, Model} from "sequelize"
import {Provider} from "./Provider"
import {sequelize} from "../../database"

interface ProvidersMetadataType {
  id?: number
  provider: ForeignKey<Provider["account"]>,
  metadata: string
  chainId: number
}

export class ProvidersMetadata extends Model<ProvidersMetadataType, InferCreationAttributes<ProvidersMetadata>> {
  declare id: CreationOptional<number>
  declare provider: ForeignKey<Provider["account"]>
  declare metadata: string
  declare chainId: number
}

ProvidersMetadata.init({
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  metadata: DataTypes.TEXT,
  chainId: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ["provider", "chainId"]
    }
  ]
})