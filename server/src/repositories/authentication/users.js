const psql_client  = require('../../db/postgres');

const log = require('../../../logger').LOG;


module.exports.authenticate  = function (email, password, callback) {

    if(email && password && email !== "" && password !== ""){
  
          const query = `SELECT
                              id,
                              email,
                              firstname,
                              lastname,
                              phone
                        FROM public.users
                         WHERE 
                            email = ? AND password = ?`;
          const input_values = [email, password];
          console.log('input_values');
          console.log(input_values);
          psql_client.raw(query, input_values)
            .then(function (data) {
              const result = (data.rows) ? data.rows : {};
              console.log('*************result Inside the query execution ******************');
              console.log(result);
              callback(result);
            }).catch(function (error) {
              log.error(`Error: ${error}`);
              callback(error, null);
          });
    } else {
      const result = {
        rows: []
      }
      callback(result);
    }
  };

  
module.exports.findUserByEmail  = function (email, callback) {
    if(email && email !== ""){
      const query = `SELECT
                          id,
                          email,
                          firstname,
                          lastname,
                          phone
                      FROM public.users
                      WHERE 
                        email = ?`;
  
      const input_values = [email];
      psql_client.raw(query, input_values)
        .then(function (data) {
          const result = (data.rows) ? data.rows : {};
          callback(result);
        }).catch(function (error) {
          log.error(`Error: ${error}`);
          callback(error, null);
      });
    } else {
      const result = {
        rows: []
      }
      callback(result);
    }
  };
  