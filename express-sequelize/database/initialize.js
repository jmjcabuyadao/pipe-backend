const Sequelize = require('sequelize'); 
const config = require('../config/config.json').database;

const Database = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        dialect: config.dialect
    }
);

module.exports = {
    Sequelize,
    Database
}