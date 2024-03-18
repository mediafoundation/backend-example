import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import {sequelize} from "../database";

export class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
    declare account: string;
}

Provider.init({
    account: {type: DataTypes.STRING, primaryKey: true},
}, {
    sequelize,
    timestamps: false,
    freezeTableName: true
});