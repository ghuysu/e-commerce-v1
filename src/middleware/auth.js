const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    try{
        const authHeader = req.get('Authorization');
        if(!authHeader)
        {
            const error = new Error("AUTHORIZATION FAILED");
            error.statusCode = 422;
            throw error;
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, "touyenlanguoiyeucuatoi");
        req.userId = decodedToken.userId;
        req.email = decodedToken.email;
        if(decodedToken.storeId){
            req.storeId = decodedToken.storeId;
        }
        req.isAuth = true;
        next();
    }
    catch(err){
        req.isAuth = false;
        next(err);
    }
}