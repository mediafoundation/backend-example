import {sequelize} from "../database";
import {DataTypes} from "sequelize";

export const BandwidthLimit = sequelize.define("BandwidthLimit", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    amount: DataTypes.BIGINT,
    period: DataTypes.STRING,
    unit: DataTypes.STRING,
}, {
    freezeTableName: true
});