var Client = require('instagram-private-api').V1;

exports.getMyInfo = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();
        
        //const me = await Client.Account.showProfile(session);
        //const me2 = await Client.Account.getById(session, 10912739);
        //const rel = await Client.Relationship.get(session, 10912739)
        //const feed = new Client.Feed.AccountFollowers(session, accountId, 100);
         const loc = await Client.Location.search(session, 'experimente');
        // const locFeed = new Client.Feed.LocationMedia(session, loc.id, 20);
        // const media = await locFeed.all();

        //var hash = await Client.Hashtag.info(session, 'homebrew');
        //const locFeed = new Client.Feed.TaggedMedia(session, 'homebrew', 20);
        //const media = await locFeed.all();
        //17842289734067549
        
        res.status(200).send();

    } catch (error) {
        res.status(500).send(error.message);
    }
}