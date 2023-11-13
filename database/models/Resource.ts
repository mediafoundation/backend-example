import {DataTypes} from "sequelize";
import {getSequelizeInstance} from "../../config/config";

let sequelizeInstance = getSequelizeInstance()

export const Resource= sequelizeInstance.define("Resources",
    {
        id: {type: DataTypes.STRING, primaryKey: true},
        owner: DataTypes.STRING,
        label: DataTypes.STRING,
        protocol: DataTypes.STRING,
        origin: DataTypes.STRING,
        path: DataTypes.STRING,
        domain: DataTypes.STRING,
        network: DataTypes.STRING,
    },
    {
        modelName: 'Resource',
        freezeTableName: true
    }
);
