import {DataTypes} from "sequelize";
import {sequelize} from "../../database";
import {DealsNodeLocations} from "./DealsNodeLocations";
import {Deal} from "./Deal";

export const DealsLocations = sequelize.define("DealsLocations", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    dealId: {
        type: DataTypes.STRING,
        references: {
            model: 'Deal',
            key: 'id',
        }
    },
    nodeId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'DealsNodeLocations',
            key: 'id'
        }
    },
}, {
    modelName: 'DealsLocations',
    freezeTableName: true
});

DealsNodeLocations.belongsToMany(Deal, {through: DealsLocations, foreignKey: 'nodeId'})
Deal.belongsToMany(DealsNodeLocations, {through: DealsLocations, foreignKey: "dealId"});