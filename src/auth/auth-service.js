var jwt = require('jsonwebtoken');
var config = require('../config');

exports.generateToken = async (data) => {
    return jwt.sign(data, config.privateKey);
}

exports.decodeToken = async (token) => {
    return jwt.verify(token, config.privateKey);
}

exports.authorize = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.privateKey, (error, decoded) => {
            if (error) {
                res.status(401).send({
                    message: 'token inválido.'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.status(401).send({
            message: 'Acesso restrito.'
        });
    }
}