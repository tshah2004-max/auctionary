const { getIdFromToken } = require('../models/user.server.model'); 

const isAuthenticated = function(req, res, next){
    let token = req.get('X-Authorization');
    if (!token) return res.sendStatus(401);

    getIdFromToken(token, (err, id) => {
        if(err || id === null) {
            return res.sendStatus(401);
        }
        req.user_id = id;
        next();
    });
};

module.exports = {
isAuthenticated
}