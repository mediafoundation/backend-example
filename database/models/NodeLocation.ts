import {sequelize} from "../database";
import {DataTypes} from "sequelize";

export const NodeLocation = sequelize.define("NodeLocation", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    location: DataTypes.STRING,
}, {
    freezeTableName: true
});