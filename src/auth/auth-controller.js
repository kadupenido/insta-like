exports.authenticate = async (req, res, next) => {

    try {

        var Client = require('instagram-private-api').V1;
        var device = new Client.Device('someuser');
        var storage = new Client.CookieFileStorage(__dirname + '/cookies/someuser.json');

        res.status(200).send();

    } catch (e) {
        res.status(500).send(e);
    }
}