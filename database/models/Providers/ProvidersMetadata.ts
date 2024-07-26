import {CreationOptional, DataTypes, ForeignKey, InferCreationAttributes, Model} from "sequelize"
import {Provider} from "./Provider"
import {sequelize} from "../../database"

type ProvidersMetadataType = {
  id?: number
  provider: string,
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
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  provider: {
    type: DataTypes.STRING,
    references: {
      model: Provider,
      key: "account"
    }
  },
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