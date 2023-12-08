import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const OffersBandwidthLimit = sequelize.define("OffersBandwidthLimit", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    amount: DataTypes.BIGINT,
    period: DataTypes.STRING,
    unit: DataTypes.STRING,
}, {
    modelName: 'OffersBandwidthLimit',
    freezeTableName: true
});