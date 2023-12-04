import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const DealsMetadata = sequelize.define("DealsMetadata", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    label: DataTypes.STRING,
    bandwidthLimitId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'BandwidthLimit',
            key: 'id'
        }
    },
    autoSsl: DataTypes.BOOLEAN,
    burstSpeed: DataTypes.BIGINT,
    apiEndpoint: DataTypes.STRING,
    customCnames: DataTypes.STRING,
}, {
    modelName: 'DealsMetadata',
    freezeTableName: true
});

export type DealsMetadata = {
    id: number,
    label: string,
    bandwidthLimit: string,
    autoSsl: boolean,
    burstSpeed: number,
    nodeLocations: string,
    apiEndpoint: string,
    customCnames: string
}