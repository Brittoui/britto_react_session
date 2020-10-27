var jwt = require('jwt-simple');
var secretKey = require('../../controllers/authentication/secret');
var util = require('../../../common/utilities');
var constants = require('../../../common/constants');

var userRepo = require('../../../repositories/authentication/users');
const logger = require('../../../../logger');


var log = logger.LOG;
var auth = {
    login: function(req, res) {
        var email = req.body.email || '';
        var password = req.body.password || '';
        var timezone_offset = req.body.timezone_offset || 0;
        if(email ==='' || password ===''){
            let msg = "Failed to authenticate. email or password cannot be null";
            log.debug('Error : k'+ msg);
            res.status(constants.http_status.UNAUTHORIZED);
            res.json({
                "status":constants.http_status.UNAUTHORIZED,
                "message":msg,
                "payload":null,
                "user_id":constants.user.DEFAULT_SUPER_ADMIN_USER_ID
            });
        }else{
            auth.validate(email, password,req.hostname,req.ip,function(err,data){                
                if(err){
                    userRepo.findUserByEmail(email,function(users){
                        if(!users || users.length <= 0){
                            let msg = "Failed to authenticate. Please check your email address and password";
                            const content = {
                                "status":constants.http_status.UNAUTHORIZED,
                                "message":msg,
                                "payload":null
                            };
                            util.sendJSONresponse(res,constants.http_status.OK,content);
                        }else{
                            let msg = "Failed to authenticate. Please check your email address and password";
                            const content ={
                                "status":constants.http_status.UNAUTHORIZED,
                                "message":msg,
                                "payload":null
                            };
                            util.sendJSONresponse(res,constants.http_status.OK,content);
                        }
                    });
                }else{
                    if(data.user){
                        const jwt = generateJWT(data.user,timezone_offset);
                        const payload = util.decodeJWT(jwt);
                        payload.accessToken = jwt;
                                               
                        const key = util.createUserSessionKey(payload.user.id,payload.createdAt);

                        const userLoginInfo = {
                            "user:": payload.user,
                            "token":payload.accessToken,
                            "createdAt": payload.createdAt
                        };

                        res.status(constants.http_status.OK).json({
                            "status": constants.http_status.OK,
                            "message": null,
                            "payload": payload
                        });
                    }
                }
            });
        }
    },
    logout:function(req, res) {
        const key = util.getUserSessionKey(req);
        if (key) {
            log.debug('Logging out user: '+key);
            userSessionCache.removeSession(key);
            userSessionCache.printStatus();
            res.status(constants.http_status.OK).json({
                "status": "SUCCESS",
                "message": "Successfully logging out a user.",
                "payload": {}
            });
        }
    },
    validate: function(email, password, hostname, remoteIP, callback) {
      userRepo.authenticate(email, password, function(result) {
          const validUser = (result && result.length>0) || false;
          if (validUser === true) {
              const user = result[0];
                  callback(null, {
                      user: user
                  });
          } else {
              const msg = `FAILED in authenticating user by email: ${email}`;
              log.debug(msg);
              callback({msg: msg}, null);
          }
        })
    },

    
}

function generateJWT(user,timezone_offset) {
    return jwt.encode({
        exp:expiresIn(constants.auth.TOKEN_VALIDITY_SEVEN_DAYS),
        user:user,
        createdAt: new Date().getTime()
    },secretKey.getSecretKey());
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;