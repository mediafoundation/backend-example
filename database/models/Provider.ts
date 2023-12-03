import {DataTypes} from "sequelize";
import {sequelize} from "../database";

export const Provider = sequelize.define("Providers", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    account: DataTypes.STRING,
}, {
    modelName: 'Provider',
    freezeTableName: true
});