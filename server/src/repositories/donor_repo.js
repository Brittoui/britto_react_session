const psql_client = require('../db/postgres');

module.exports.getUserData = (callback) => {
  const query = `SELECT * FROM public.blood_table`;

psql_client.raw(query)
        .then(function (result) {
          callback(null, result);
        }).catch(function (error) {
            callback(error, null);
      });
   
  }


  module.exports.getUserDataById = (id,callback) => {
    const query = `SELECT * FROM public.blood_table where id= ${id}`;
  
  psql_client.raw(query)
          .then(function (result) {
              console.log(result)
            callback(null, result);
          }).catch(function (error) {
              callback(error, null);
        });
     }


    

  module.exports.updateUserData = (payload,callback) => {

    const id = payload?payload.id: null;
    const name = payload?payload.name: null;
    const email = payload?payload.email: null;
    const phone = payload?payload.phone: null;
    const phone2 = payload?payload.alt_phone: null;


    const query = `UPDATE public.blood_table set donor_name = '${name}', email = '${email}', contact_number = '${phone}', alt_contact_number = '${phone2}' where id = ${id}`;
  
  psql_client.raw(query)
          .then(function (result) {
            callback(null, result);
          }).catch(function (error) {
              callback(error, null);
        });
     
    }


    
  module.exports.deleteUserData = (payload,callback) => {

    const id = payload?payload.id: null;


    const query = `DELETE from public.blood_table where id = ${id}`;
  
  psql_client.raw(query)
          .then(function (result) {
            callback(null, result);
          }).catch(function (error) {
              callback(error, null);
        });
     
    }