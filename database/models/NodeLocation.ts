import {sequelize} from "../database";
import {
    BelongsToManyGetAssociationsMixin,
    CreationOptional,
    DataTypes, ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import {Deal} from "./deals/Deal";

export class NodeLocation extends Model<InferAttributes<NodeLocation>, InferCreationAttributes<NodeLocation>> {
    declare id: CreationOptional<number>
    declare location: string;
    declare dealId: ForeignKey<Deal['id']>
    declare getDeals: BelongsToManyGetAssociationsMixin<Deal>
}

NodeLocation.init({
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    location: DataTypes.STRING,
}, {
    sequelize,
    freezeTableName: true
})