// database/models/DealsMetadataNodeLocations.ts
import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const OffersMetadataNodeLocations = sequelize.define("OffersMetadataNodeLocations", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    metadataId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'OffersMetadata',
            key: 'id'
        }
    },
    nodeId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'OffersNodeLocations',
            key: 'id'
        }
    },
}, {
    modelName: 'OffersMetadataNodeLocations',
    freezeTableName: true
});