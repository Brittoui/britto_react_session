const donorRepo = require('../../repositories/donor_repo');


module.exports.getUserData = function(req, res) {

    res.setHeader('content-Type', 'applicaion/json');

    const params = req.params;
    const id = params ? params.id : null;
if(id){
    donorRepo.getUserDataById(id,function(error, result){
        if(error){
            res.statusCode = 200;
            console.log(error);
            console.log(`Error Occurred: ${JSON.stringify(error)}`);
            res.write(`Error Occurred: ${JSON.stringify({error})}`);
            res.end();
        }
        if(result){
            console.log('ROW COUNT: '+result.rowCount);
            if(result.rowCount > 0){
                const records = result.rows ? result.rows : [];
                const respObj = {
                    status: 'SUCCESS',
                    message: "Blood Donors details fetched successfully",
                    data: records
                };
                res.status(200).json(respObj);
              }else{
                const respObj = {
                    status: 'FAILURE',
                    message: "Blood Donors details not found",
                    data: []
                };
                res.status(200).json(respObj);
              }
        }
    });

}else{
    donorRepo.getUserData(function(error, result){
        if(error){
            res.statusCode = 200;
            console.log(error);
            console.log(`Error Occurred: ${JSON.stringify(error)}`);
            res.write(`Error Occurred: ${JSON.stringify({error})}`);
            res.end();
        }
        if(result){
            const records = result.rows ? result.rows : [];
            const respObj = {
                status: 'SUCCESS',
                message: "Blood Donors details fetched successfully",
                data: records
              };
              res.status(200).json(respObj);
        }
    });

}   
}



module.exports.updateUserData = function(req, res) {
    const payload = req.body;
    donorRepo.updateUserData(payload,function(error, result){
        if(error){
            res.statusCode = 200;
            console.log(error);
            console.log(`Error Occurred: ${JSON.stringify(error)}`);
            res.write(`Error Occurred: ${JSON.stringify({error})}`);
            res.end();
        }
        if(result){
            console.log('update query');
            console.log('ROW COUNT: '+result.rowCount);
            if(result.rowCount > 0){
                const records = result.rows ? result.rows : [];
                const respObj = {
                    status: 'SUCCESS',
                    message: "Blood Donors Updated successfully",
                    data: records
                };
                res.status(200).json(respObj);
            }else{
                const respObj = {
                    status: 'SUCCESS',
                    message: "Blood Donors not exists, hence can't update the details",
                    data: []
                };
                res.status(200).json(respObj);
            }
        }
    });
}


module.exports.deleteUserData = function(req, res) {
    const payload = req.body;
    donorRepo.deleteUserData(payload,function(error, result){
        if(error){
            res.statusCode = 200;
            console.log(error);
            console.log(`Error Occurred: ${JSON.stringify(error)}`);
            res.write(`Error Occurred: ${JSON.stringify({error})}`);
            res.end();
        }
        if(result){
            if(result.rowCount > 0){
                const records = result.rows ? result.rows : [];
                const respObj = {
                    status: 'SUCCESS',
                    message: "Blood Donors Deleted successfully",
                    data: records
                };
                res.status(200).json(respObj);
            }else{
                const respObj = {
                    status: 'SUCCESS',
                    message: "Blood Donors Details was already deleted!!",
                    data: []
                };
                res.status(200).json(respObj);
            }
        }
    });
}