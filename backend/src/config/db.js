const knex = require('knex');
const knexfile = require('../../knexfile');

// Initialize the database connection using the development settings in knexfile.js
const db = knex(knexfile.development);

module.exports = db;