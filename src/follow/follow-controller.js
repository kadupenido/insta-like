var Client = require("instagram-private-api").V1;
var exceptions = require("instagram-private-api").V1.Exceptions;
var _ = require("lodash");
var Promise = require("bluebird");
var followProvider = require("./follow-provider");
var genderService = require("../gender/gender-service");

exports.followEndLike = async (req, res, next) => {
    try {
        const session = req.session;
        const accountId = await session.getAccountId();
        const amountFollow = req.body.amountFollow;
        const gender = req.body.gender;

        let feed;
        let amountFollowed = 0;
        let index = 0;

        switch (req.body.by) {
            case "location":
                feed = new Client.Feed.LocationMedia(session, req.body.locationId, 1000);
                break;

            case "hashtag":
                feed = new Client.Feed.TaggedMedia(session, req.body.tag, 1000);
                break;

            default:
                res.status(500).send({ message: "Invalid by." });
                return;
                break;
        }

        let data = await feed.get();
        follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.fixFollowBugs = async (req, res, next) => {
    try {
        const session = req.session;
        const accountId = await session.getAccountId();
        const follows = await followProvider.getFollowing(accountId);

        for (let i = 0; i < follows.length; i++) {
            const e = follows[i];
            const rel = await Client.Relationship.get(session, e.userFollowerId);

            console.log("");
            console.log(e.userFollowerId);

            if (!rel.params.following) {
                await followProvider.delete(accountId, e.userFollowerId);
                console.log("Remove: ", e.userFollowerId);
            }
        }

        res.status(200).send({
            message: "Bugs fixed"
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

function follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender) {
    //Se já seguiu a qtde solicitada para a execução
    if (amountFollowed >= amountFollow) {
        console.log("End request.");
        res.status(200).send({ message: "End request." });
        return;
    }

    //Se não tiver mais dados suficientes, busca mais
    if (index >= data.length) {
        try {

            console.log("Find data");

            if (!feed.isMoreAvailable()) {
                console.log("No more data");
                res.status(200).send({ message: "No more data" });
                return;
            }

            feed.get().then(newData => {
                console.log("New data loaded");
                console.log("");

                data = newData;
                index = 0;
                follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
            }, (err) => {
                console.error(err);
                res.status(500).send(err);
            });

        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }

        return;
    }

    const e = data[index];

    //Se ja segue pula pro proximo
    if (e.account.params.friendshipStatus.following) {
        console.log("*** ", e.account.params.fullName || e.account.params.username, " *** Já segue");
        console.log("");
        index++;
        follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
        return;
    }

    followProvider.followedOnce(accountId, e.account.id).then(following => {
        //Se ja seguiu algum dia pula pro proximo.
        if (following) {
            //Se não segue no instagram mas no banco segue é um bug.
            if (following.following) {
                console.log("BUG: ", e.account.params.fullName || e.account.params.username, " (", e.account.id, ")");
                console.log("");
            }

            index++;
            follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
            return;
        }

        console.log("*** ", e.account.params.fullName || e.account.params.username, " ***");

        genderService.getGender(e.account.params.fullName || e.account.params.username).then((resGender) => {

            if (gender && gender != resGender) {
                index++;
                follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
                return;
            }

            //Segue no instagram
            Client.Relationship.create(session, e.account.id).then((rel) => {
                console.log("Following.");

                //Marca no banco que seguiu
                followProvider.createUser(accountId, e.account.id).then(() => {
                    console.log("Updated database.");

                    //Marca a qntde ja seguida
                    amountFollowed++;

                    //Curte a foto
                    Client.Like.create(session, e.id).then((like) => {
                        console.log("Liked photo.");
                        console.log("");

                        index++;
                        follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
                    }, (err) => {
                        console.error(err);

                        if (err instanceof exceptions.RequestsLimitError) {
                            res.status(500).send({ message: err.message });
                            return;
                        }

                        index++;
                        follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
                    });
                }, (err) => {
                    console.error(err);

                    if (err instanceof exceptions.RequestsLimitError) {
                        res.status(500).send({ message: err.message });
                        return;
                    }

                    index++;
                    follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
                });
            }, (err) => {
                console.error(err);

                if (err instanceof exceptions.RequestsLimitError) {
                    res.status(500).send({ message: err.message });
                    return;
                }

                index++;
                follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
            });
        })
            .catch(err => {
                console.error(err);

                if (err instanceof exceptions.RequestsLimitError) {
                    res.status(500).send({ message: err.message });
                    return;
                }

                index++;
                follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
            });
    }, (err) => {
        console.error(err);

        if (err instanceof exceptions.RequestsLimitError) {
            res.status(500).send({ message: err.message });
            return;
        }

        index++;
        follow(session, res, feed, data, index, accountId, amountFollowed, amountFollow, gender);
    });
}

exports.unfollow = async (req, res, next) => {
    try {
        const session = req.session;
        const accountId = await session.getAccountId();
        const follows = await followProvider.getFollowing(accountId);

        const dateToUnfollow = new Date(req.body.dateToUnfollow);
        const followedBy = req.body.followedBy;

        let index = 0;

        unfollow(res, session, follows, index, dateToUnfollow, followedBy);

    } catch (error) {
        res.status(500).send(error.message);
    }
};

function unfollow(res, session, follows, index, dateToUnfollow, followedBy) {

    if (index >= follows.length) {
        res.status(200).send({ message: "End request." });
        return;
    }

    const e = follows[index];

    console.log("");
    console.log(index + 1, '/', follows.length);
    console.log('*** ', e.userFollowerId, "***");

    //Checa se deve dar unfollow
    if (dateToUnfollow && e.followAt < dateToUnfollow) {

        console.log("Não deve dar unfollow");

        index++;
        unfollow(res, session, follows, index, dateToUnfollow, followedBy);
        return;
    }

    //Busca a amizade
    Client.Relationship.get(session, e.userFollowerId).then((rel) => {

        //Remove possiveis bugs
        if (!rel.params.following) {

            console.log("BUG");

            followProvider.unfollow(e.userId, e.userFollowerId).then(() => {
                console.log("DB atualizada.");
                index++;
                unfollow(res, session, follows, index, dateToUnfollow, followedBy);

            }, (err) => {
                console.error(err);
                index++;
                unfollow(res, session, follows, index, dateToUnfollow, followedBy);
            });

            return;
        }

        //Checa se deve dar unfollow
        if (followedBy && !rel.params.followed_by) {

            console.log("Não deve dar unfollow");

            index++;
            unfollow(res, session, follows, index, dateToUnfollow, followedBy);
            return;
        }

        //Da unfollow no instagram
        Client.Relationship.destroy(session, e.userFollowerId).then((relStatus) => {

            console.log("unfollow no instagram.");

            //Atualiza o banco
            followProvider.unfollow(e.userId, e.userFollowerId).then(() => {

                console.log("DB atualizada.");

                index++;
                unfollow(res, session, follows, index, dateToUnfollow, followedBy);

            }, (err) => {
                console.error(err);
                index++;
                unfollow(res, session, follows, index, dateToUnfollow, followedBy);
            });

        }, (err) => {
            console.error(err);

            if (err instanceof exceptions.RequestsLimitError) {
                res.status(500).send({ message: err.message });
                return;
            }

            index++;
            unfollow(res, session, follows, index, dateToUnfollow, followedBy);
        });

    }, (err) => {
        console.error(err);

        if (err instanceof exceptions.RequestsLimitError) {
            res.status(500).send({ message: err.message });
            return;
        }

        index++;
        unfollow(res, session, follows, index, dateToUnfollow, followedBy);
    });
}