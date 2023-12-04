import {Dialect, Sequelize} from "sequelize";
require('dotenv').config()

let sequelize: Sequelize;

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

export {sequelize}
