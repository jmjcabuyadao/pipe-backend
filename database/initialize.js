const Sequelize = require('sequelize'); 
const config = require('../config/config.json').database;

const host = process.env.MYSQL_HOST || config.host
const database = process.env.MYSQL_DATABASE || config.database;
const username = process.env.MYSQL_USER || config.username;
const password = process.env.MYSQL_PASSWORD || config.password;
const dialect = config.dialect || 'mysql'

console.log()
const Database = new Sequelize(
    database,
    username,
    password,
    {
        host,
        dialect
    }
);

module.exports = {
    Sequelize,
    Database
}