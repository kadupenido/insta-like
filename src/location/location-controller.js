var Client = require('instagram-private-api').V1;
var genderService = require("../gender/gender-service");

exports.getLocations = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = req.session;

        Client.Location.search(session, req.body.locationName).then((loc) => {

            let data = [];

            for (let i = 0; i < loc.length; i++) {
                const e = loc[i].params;
                data.push({
                    id: e.id,
                    title: e.title,
                    address: e.subtitle
                });
            }

            res.status(500).send({
                success: true,
                data: data
            });

        }, (e) => {
            res.status(500).send({
                success: false,
                message: e.message || e
            });
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message || e
        });
    }
}

exports.getUsersByLocationMedia = async (req, res, next) => {
    try {

        const session = req.session;
        const locationId = req.body.locationId;
        const cursor = req.body.cursor;
        const gender = req.body.gender;

        const feed = new Client.Feed.LocationMedia(session, locationId, 2000);

        if (cursor) {
            feed.setCursor(cursor);
        }

        feed.get().then((medias) => {

            let index = 0;
            let data = [];

            addUserId(res, medias, index, data, feed.getCursor(), gender);

        }, (e) => {
            res.status(500).send({
                success: false,
                message: e.message || e
            });
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            message: e.message || e
        });
    }
}

function addUserId(res, medias, index, data, cursor, gender) {

    if (index >= medias.length) {
        res.status(200).send({
            success: true,
            cursor: cursor,
            data: data
        });
        return;
    }

    const account = medias[index].params.account;

    if (data.includes(account.id)) {
        index++;
        addUserId(res, medias, index, data, cursor, gender);
    }

    if (gender) {
        genderService.getGender(account.fullName || account.username).then((resGender) => {
            if (gender == resGender) {
                data.push(account.id);
            }

            index++;
            addUserId(res, medias, index, data, cursor, gender);

        }, (e) => {
            index++;
            addUserId(res, medias, index, data, cursor, gender);
        });

        return;
    }

    data.push(account.id);
    index++;
    addUserId(res, medias, index, data, cursor, gender);
}