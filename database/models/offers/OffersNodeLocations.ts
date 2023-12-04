import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const OffersNodeLocations = sequelize.define("OffersNodeLocations", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    location: DataTypes.STRING,
}, {
    modelName: 'OffersNodeLocations',
    freezeTableName: true
});

export type NodesLocationType = {
    id: number,
    location: string
}