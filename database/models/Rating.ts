import {DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Provider} from "./Providers/Provider"
import {sequelize} from "../database"
import {Chain} from "./Chain"

/*type RatingAttributes = {
  id: number,
  provider: ForeignKey<Provider["account"]>,
  client: ForeignKey<Client["account"]>,
  chainId: ForeignKey<Chain["chainId"]>,
  rating: number
}*/

export class Rating extends Model<InferAttributes<Rating>, InferCreationAttributes<Rating>> {
  declare provider: ForeignKey<Provider["account"]>
  declare chainId: ForeignKey<Chain["chainId"]>
  declare sum: number
  declare count: number
}

Rating.init({
  sum: {
    type: DataTypes.BIGINT
  },
  count: {
    type: DataTypes.BIGINT
  }
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