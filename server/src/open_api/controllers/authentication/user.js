//var debugConsole = require("../../../db/console.screen");
//var User = require("../../../models/config/user");
const util = require('../../../common/utilities');
const log = require('../../../main/logger').LOG;
var constants = require('../../../common/constants');
var userRepo = require('../../../repositories/admin_users/users');

module.exports.validateAccount = function(req, res) {
    log.debug('user.controller.validateAccount called');

    const username = (req && req.body) ? req.body.username : '';
    const password = (req && req.body) ? req.body.password : '';

    if(username && username.length>0 && password && password.length>0) {
      userRepo.validateUsernameAndPassword(username, password, function(validity, result){

      });
    }else{
      const result = {
        status: "FAILED",
        status_code: constants.http_status.BAD_REQUEST,
        message: "Invalid username and/or password."
      }
      res.status(constants.http_status.OK).json(result);
    }


  // const result = {
  //   message: "data fetched successfully"
  // }
  // res.status(constants.http_status.OK).json(result);
}
