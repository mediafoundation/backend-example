import {Dialect, Op, Sequelize} from "sequelize";
require('dotenv').config()

let sequelize: Sequelize;

const DECIMALS_DIGITS = 50;

if(process.env.NODE_ENV === 'test') {
    sequelize = new Sequelize('sqlite::memory', {logging: false})
}

else{
    sequelize = new Sequelize(process.env.dbName!, process.env.dbUser!, process.env.dbPassword, {
        host: process.env.dbHost,
        dialect: process.env.dbDialect as Dialect,
        port: parseInt(process.env.dbPort!),
        logging: false
    });
}

export {sequelize, Op, DECIMALS_DIGITS}
