const { API_SECRET } = require('../config/env');

module.exports = function auth(req, res, next) {
    if (req.body.token !== API_SECRET) {
        return res.status(403).json({ success: false, message: 'Access Denied.' });
    }
    next();
};
