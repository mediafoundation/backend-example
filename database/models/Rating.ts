import {DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Provider} from "./Providers/Provider"
import {Client} from "./Clients/Client"
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
  declare client: ForeignKey<Client["account"]>
  declare chainId: ForeignKey<Chain["chainId"]>
  declare rating: number
}

Rating.init({
  rating: {
    type: DataTypes.NUMBER,
    validate: {
      max: 5,
      min: 1
    }
  }
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ["provider", "client", "chainId"]
    }
  ]
})