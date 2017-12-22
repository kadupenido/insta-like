var authService = require('./auth-service');

exports.authenticate = async (req, res, next) => {
    try {

        const token = await authService.generateToken({
            user: req.body.user,
            password: req.body.password
        });

        res.status(200).send(token);

    } catch (e) {
        res.status(401).send({
            success: false,
            message: e || e.message
        });
    }
}

exports.authorize = async (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    const auth = await authService.authorize(token);

    if (auth.success) {
        req.session = auth.session;
        next();
    } else {
        res.status(401).send({
            success: false,
            message: auth.message
        });
    }
}