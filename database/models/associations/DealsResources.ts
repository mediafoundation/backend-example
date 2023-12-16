import {sequelize} from "../../database";
import {DataTypes} from "sequelize";
import {DealsNodeLocations} from "../deals/DealsNodeLocations";
import {Deal} from "../deals/Deal";
import {DealsLocations} from "../deals/DealsLocations";
import {Resource} from "../Resource";

export const DealsResources = sequelize.define("DealsResources", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    dealId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Deals',
            key: 'id'
        }
    },
    resourceId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Resources',
            key: 'id'
        }
    },
}, {
    modelName: 'DealsResources',
    freezeTableName: true
})

Resource.belongsToMany(Deal, {through: DealsLocations, foreignKey: 'resourceId'})
Deal.belongsToMany(Resource, {through: DealsLocations, foreignKey: "dealId"});