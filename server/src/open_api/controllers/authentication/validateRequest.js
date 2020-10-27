var jwt = require('jwt-simple');
var userList = require("../../../models/config/user");
var secretKey = require('../../controllers/authentication/secret');
var constants = require('../../../common/constants');


module.exports = function(req, res, next) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

    if (typeof token === 'undefined') {
        if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') != -1) {
            token = '' + req.headers['authorization'];
        }
    }

    if (token) {
        try {
            firstLevelValidation(token, function (status, response) {
                if (status===constants.auth.TOKEN_STATUS_OK && response) {
                    req.user = response.user;
                    req.timezone_offset = response.timezone_offset;
                    var login_user_id = response.user.id;
                    var login_user_type_id = response.user.userTypeId;
                    var tokenCreatedAt = response.createdAt;

                    secondLevelValidation(login_user_id, login_user_type_id, tokenCreatedAt, function (status) {

                        if (status === constants.auth.TOKEN_STATUS_OK) {
                            var login_user_companyId = (req.body && req.body.companyId) || (req.query && req.query.companyId) || req.headers['x-companyId'] || -1;
                            var login_user_monitorId = (req.body && req.body.monitorId) || (req.query && req.query.monitorId) || req.headers['x-monitorId'] || -1;
                            thirdLevelValidation(login_user_companyId, login_user_monitorId, login_user_id, login_user_type_id, function (status) {
                                if (status === constants.auth.TOKEN_STATUS_OK) {
                                        next();
                                }else if(status === constants.auth.TOKEN_STATUS_UNAUTHORIZED){
                                    res.status(constants.http_status.OK).json(reportUnAuthorized());
                                }else{
                                    res.status(constants.http_status.UNAUTHORIZED).json(reportTokenExpired());
                                }
                            });
                        }else if(status === constants.auth.TOKEN_STATUS_RESET){
                            res.status(constants.http_status.UNAUTHORIZED).json(reportTokenExpired());
                        }else{
                            res.status(constants.http_status.UNAUTHORIZED).json(reportTokenInvalid());
                        }
                    });
                }
                if(status === constants.auth.TOKEN_STATUS_EXPIRED){
                    res.status(constants.http_status.UNAUTHORIZED).json(reportTokenExpired());
                }
            });
        } catch (err) {
            res.status(constants.http_status.UNAUTHORIZED).json(reportTokenMalformed());
        }
    } else {
        res.status(constants.http_status.UNAUTHORIZED).json(reportTokenInvalid());
    }

};

function firstLevelValidation(token, callback) {
    console.log('Inside firstLevelValidation');
    var decodedToken = jwt.decode(token, secretKey.getSecretKey());
    if (decodedToken.exp <= Date.now()) {
        callback(constants.auth.TOKEN_STATUS_EXPIRED, null);
    } else {
        callback(constants.auth.TOKEN_STATUS_OK, decodedToken);
    }
}

function secondLevelValidation(userId, userTypeId, tokenCreatedAt, callback) {
    if(userTypeId === constants.user.SUPER_USER_TYPE_ID){ //Info: No need to validate token creation time for Super users
        callback(constants.auth.TOKEN_STATUS_OK);
    }else{
        serviceResetUser.verifyUserLoginStatusInfo(userId, tokenCreatedAt, (success) =>{
            if(success){
                callback(constants.auth.TOKEN_STATUS_OK);
            }else{
                callback(constants.auth.TOKEN_STATUS_RESET);
            }
        });
    }
}

function thirdLevelValidation(companyId, monitorId, userId, userTypeId, callback){
    // Authorize the user to see if s/he can access our resources
    if (companyId && companyId != -1) {
        userList.findCompanyByCompanyIdByUserId(companyId, userId, userTypeId).then(function(dataResponse) {
            if (dataResponse.rows.length == 0) {
                callback(constants.auth.TOKEN_STATUS_UNAUTHORIZED);
            } else {
                if (monitorId && monitorId != -1) {
                    userList.findMonitorByMonitorIdByUserId(monitorId, userId, userTypeId).then(function(dataResponse) {
                        if (dataResponse.rows.length == 0) {
                            callback(constants.auth.TOKEN_STATUS_UNAUTHORIZED);
                        } else {
                            callback(constants.auth.TOKEN_STATUS_OK);
                        }
                    });
                } else {
                    callback(constants.auth.TOKEN_STATUS_OK);
                }
            }
        });
    } else {
        if (monitorId && monitorId != -1) {
            userList.findMonitorByMonitorIdByUserId(monitorId, userId, userTypeId).then(function(dataResponse) {
                if (dataResponse.rows.length == 0) {
                    callback(constants.auth.TOKEN_STATUS_UNAUTHORIZED);
                } else {
                    callback(constants.auth.TOKEN_STATUS_OK);
                }
            });
        } else {
            callback(constants.auth.TOKEN_STATUS_OK);
        }
    }

}

function reportUnAuthorized(){
    var responseJSON = {
        //"status": "UNAUTHORIZED",
        "status": constants.http_status.UNAUTHORIZED,
        "message": "You are not authorized to view this content.",
        "responseCode": constants.http_status.UNAUTHORIZED
    };

    console.log('Token - UnAuthorized.');
    return responseJSON;
}

function reportTokenExpired(){
    var responseJSON = {
        "status": constants.http_status.UNAUTHORIZED,
        "message": "Token expired."
        };
    console.log('Token - Expired.');
    return responseJSON;
}

function reportTokenInvalid(){
    var responseJSON = {
        "status": constants.http_status.UNAUTHORIZED,
        "message": "Invalid Token."
    };
    console.log('Token - Invalid.');
    return responseJSON;
}

function reportTokenMalformed(){
    var responseJSON = {
        "status": constants.http_status.UNAUTHORIZED,
        "message": "Malformed token."
    }
    console.log('Token - Malformed.');
    return responseJSON;
}
