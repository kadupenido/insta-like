var Client = require('instagram-private-api').V1;
var authService = require('./auth-service');

exports.authenticate = async (req, res, next) => {
    try {

        const user = req.body.user;
        const password = req.body.password;
        
        const device = new Client.Device(user);
        const storage = new Client.CookieFileStorage(__dirname + '/cookies/' + user + '.json');
        const session = await Client.Session.create(device, storage, user, password);

        const token = await authService.generateToken({ user: user });

        res.status(200).send({
            token: token
        });

    } catch (e) {
        res.status(401).send(e.message);
    }
}

exports.getSession = async () => {

}