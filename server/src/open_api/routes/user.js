var ctrlAuth = require('../controllers/authentication/auth');


module.exports = function(router){
    console.log('configure users routes from blood donor mgmt (Open API)');
    router
        .route('/api/user/login')
        .post(ctrlAuth.login);
        
    router
        .route('/api/user/logout')
        .get(ctrlAuth.logout);

    return router;
}