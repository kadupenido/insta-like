var Client = require('instagram-private-api').V1;

exports.getLocations = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();

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

            res.status(200).send(data);

        }, (err) => {
            console.error(error);
            res.status(500).send(error.messenge);
        });



    } catch (error) {
        console.error(error);
        res.status(500).send(error.messenge);
    }

}