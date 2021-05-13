
import { Sequelize } from 'sequelize';
// import fs from 'fs'
import { resolve, join, basename } from 'path'
// const _basename = basename(__filename)
const env = process.env.NODE_ENV || 'development';
const config = require(resolve(__dirname + '/../config/db'))[env];

const  sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);


export { Sequelize, sequelize }