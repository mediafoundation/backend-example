import {Sequelize} from "sequelize";
require("dotenv").config()

let sequelizeInstance: Sequelize | null = null
//create me the default values for the database from process.env
export const initDatabase = (dbName: string = process.env.dbName!, dbUser: string = process.env.dbUser!, dbPassword: string = process.env.dbPassword!, dbHost: string = process.env.dbHost!, dbPort: number = parseInt(process.env.dbPort!), dbDialect: any = process.env.dbDialect) => {
  if(!sequelizeInstance){
    sequelizeInstance = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      dialect: dbDialect,
      port: dbPort,
      logging: false
    });
  }
};

export const getSequelizeInstance = () => {
  if(!sequelizeInstance){
    throw new Error("Sequelize instance not initialized. Please call initialize first.");
  }

  return sequelizeInstance
}