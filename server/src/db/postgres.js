const knex = require('knex');

const psql_config = {
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'blood_bank_db',
      user: 'postgres',
      password: 'root',
      port: '5432',
    }
  };
  
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  
  var psql_client = knex(psql_config);
  module.exports = psql_client;