import {DataTypes} from "sequelize";
import {sequelize} from "../database";

export const BandwidthLimit = sequelize.define("BandwidthLimit", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    amount: DataTypes.BIGINT,
    period: DataTypes.STRING,
    unit: DataTypes.STRING,
}, {
    modelName: 'BandwidthLimit',
    freezeTableName: true
});

export type BandwidthLimitType = {
    id: number,
    amount: number,
    period: string,
    unit: string
}