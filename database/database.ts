const {Sequelize} = require('sequelize');
require('dotenv').config();

export const sequelize = new Sequelize(process.env.dbName, process.env.dbUser, process.env.dbPassword, {
  host: process.env.dbHost,
  port: process.env.dbPort,
  dialect: process.env.dbDialect,
  logging: false
})
