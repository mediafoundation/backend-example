import {sequelize} from "../database";
import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import {Deal} from "./deals/Deal";

export class BandwidthLimit extends Model<InferAttributes<BandwidthLimit>, InferCreationAttributes<BandwidthLimit>> {
    declare id: CreationOptional<number>;
    declare dealId: ForeignKey<Deal['id']>
    declare amount: number;
    declare period: string;
    declare unit: string;
}

BandwidthLimit.init({
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    amount: DataTypes.BIGINT,
    period: DataTypes.STRING,
    unit: DataTypes.STRING,
}, {
    sequelize,
    timestamps: false,
    freezeTableName: true
})