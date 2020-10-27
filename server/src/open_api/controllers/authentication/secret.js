const {auth} = require('../../../common/constants');

module.exports.getSecretKey = function() {
    return auth.SECRET_KEY;
};