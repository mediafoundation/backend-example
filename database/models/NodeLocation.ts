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

export class NodeLocation extends Model<InferAttributes<NodeLocation>, InferCreationAttributes<NodeLocation>> {
    declare id: CreationOptional<number>
    declare dealId: ForeignKey<Deal['id']>
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