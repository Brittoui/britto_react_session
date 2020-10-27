var ctrlDonor = require('../controllers/donor_controller');

module.exports = function(router) {
    console.log('Fetch Donor APIs');

    router
        .route('/api/getdata')
        .get(ctrlDonor.getUserData);
    router
        .route('/api/getdata/:id')
        .get(ctrlDonor.getUserData);
    router
        .route('/api/updatedata')
        .post(ctrlDonor.updateUserData);
    router
        .route('/api/deletedata')
        .delete(ctrlDonor.deleteUserData);

    return router;

}