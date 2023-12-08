import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const DealsBandwidthLimit = sequelize.define("DealsBandwidthLimit", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    amount: DataTypes.BIGINT,
    period: DataTypes.STRING,
    unit: DataTypes.STRING,
}, {
    modelName: 'DealsBandwidthLimit',
    freezeTableName: true
});