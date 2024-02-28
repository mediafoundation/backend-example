import {DataTypes} from "sequelize";
import {DECIMALS_DIGITS, sequelize} from "../../database";

export const DealsBandwidthLimit = sequelize.define("DealsBandwidthLimit", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    dealId: {
        type: DataTypes.STRING,
        references: {
            model: 'Deals',
            key: 'id',
        }
    },
    amount: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
    period: DataTypes.STRING,
    unit: DataTypes.STRING,
}, {
    modelName: 'DealsBandwidthLimit',
    freezeTableName: true
});
