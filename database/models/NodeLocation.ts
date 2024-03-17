import {sequelize} from "../database";
import {
    BelongsToGetAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    CreationOptional,
    DataTypes, ForeignKey, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model
} from "sequelize";
import {Deal} from "./deals/Deal";
import {Offer} from "./offers/Offer";

export class NodeLocation extends Model<InferAttributes<NodeLocation>, InferCreationAttributes<NodeLocation>> {
    declare id: CreationOptional<number>
    declare itemId: ForeignKey<Deal['id'] | Offer['id']>
    declare location: string;
}

NodeLocation.init({
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    location: DataTypes.STRING,
}, {
    sequelize,
    timestamps: false,
    freezeTableName: true
})