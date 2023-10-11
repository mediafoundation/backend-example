const {Sequelize} = require('sequelize');
require('dotenv').config();

console.log(process.env.dbName, process.env.dbUser, process.env.dbPassword, process.env.dbHost, process.env.dbPort, process.env.dbDialect);

export const sequelize = new Sequelize(process.env.dbName, process.env.dbUser, process.env.dbPassword, {
  host: process.env.dbHost,
  port: process.env.dbPort,
  dialect: process.env.dbDialect,
  logging: false
})
