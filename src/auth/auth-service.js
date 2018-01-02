var jwt = require('jsonwebtoken');
var config = require('../config');
var Client = require('instagram-private-api').V1;

exports.generateToken = async (data) => {

    const device = new Client.Device(data.user);
    const storage = new Client.CookieFileStorage(__dirname + '/cookies/' + data.user + '.json');
    const session = new Client.Session(device, storage);
    
    const resDestroy = await session.destroy();
    const newSession = await Client.Session.create(device, storage, data.user, data.password);

    const token = jwt.sign({ data: data.user }, config.privateKey, { expiresIn: '1d' });
    let exp = new Date();
    exp.setDate(exp.getDate() + 1);

    return {
        token: token,
        exp: exp
    };
}

exports.decodeToken = async (token) => {
    return jwt.verify(token, config.privateKey);
}

exports.authorize = async (token) => {

    if (token) {
        return jwt.verify(token, config.privateKey, async (error, decoded) => {
            if (error) {
                return {
                    success: false,
                    message: 'Invalid token.'
                }
            } else {

                try {
                    const device = new Client.Device(decoded.data);
                    const storage = new Client.CookieFileStorage(__dirname + '/cookies/' + decoded.data + '.json');
                    const session = new Client.Session(device, storage);

                    const accountId = await session.getAccountId();

                    return {
                        success: true,
                        session: session,
                        accountId: accountId
                    }

                } catch (e) {

                    return {
                        success: false,
                        message: 'Invalid session.'
                    }
                }
            }
        });
    } else {
        return {
            success: false,
            message: 'Restrict access.'
        }
    }
}