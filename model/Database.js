const Sequelize = require('sequelize'); 
const config = require('../config/config.json').database;

const host = process.env.MYSQL_HOST || config.host
const port = process.env.MYSQL_PORT || config.port
const database = process.env.MYSQL_DATABASE || config.database;
const username = process.env.MYSQL_USER || config.username;
const password = process.env.MYSQL_PASSWORD || config.password;
const dialect = config.dialect || 'mysql'

const Database = new Sequelize(
    database,
    username,
    password,
    {
        host,
        port,
        dialect
    }
);

module.exports = {
    Sequelize,
    Database
}