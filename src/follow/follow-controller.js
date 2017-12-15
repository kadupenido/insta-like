var Client = require('instagram-private-api').V1;
var _ = require('lodash');
var Promise = require('bluebird');
var followProvider = require('./follow-provider');

var bugs = [];

exports.followEndLikeByLocation = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();
        //const feed = new Client.Feed.LocationMedia(session, req.body.locationId, 1000);
        const feed = new Client.Feed.TaggedMedia(session, req.body.locationId, 1000);

        const qtdeSeguir = req.body.amountOfFollow;
        let qtdeJaSeguiu = 0;
        let index = 0;

        bugs = [];

        let data = await feed.get();
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);

    } catch (error) {
        res.status(500).send(error.message);
    }
}

function seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir) {

    //Se já seguiu a qtde solicitada para a execução
    if (qtdeJaSeguiu >= qtdeSeguir) {
        console.log('Fim da solicitação');
        //fixBugs(accountId);
        res.status(200).send();
        return;
    }

    //Se não tiver mais dados suficientes, busca mais
    if (index >= data.length) {

        console.log('Buscando mais dados');

        try {

            if (!feed.isMoreAvailable()) {

                console.log('Fim dos dados');

                //fixBugs(accountId);

                res.status(200).send({
                    message: 'Fim dos dados'
                });

                return;
            }

            feed.get().then((newData) => {

                console.log('Novos dados carregados');
                console.log('');

                data = newData;
                index = 0;
                seguir(session, res, feed, data, index++, accountId, qtdeJaSeguiu, qtdeSeguir);

            }, (err) => {
                console.error(err);
                //fixBugs(accountId);
                res.status(500).send(err);
            });

        } catch (error) {
            console.error(error);
            //fixBugs(accountId);
            res.status(500).send(error);
        }

        return;
    }

    const e = data[index];

    //Se ja segue pula pro proximo
    if (e.account.params.friendshipStatus.following) {
        console.log('*** ', e.account.params.fullName || e.account.params.username, ' ***');
        console.log('');
        index++;
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
        return;
    }

    followProvider.followedOnce(accountId, e.account.id).then((follow) => {

        //Se ja seguiu algum dia pula pro proximo.
        if (follow) {

            //Se não segue no instagram mas no banco segue é um bug.
            if (follow.following) {
                console.log('BUG: ', e.account.params.fullName || e.account.params.username, ' (', e.account.id, ')');
                console.log('');

                bugs.push({
                    id: e.account.id,
                    remover: !follow.unfollowAt
                });
            }

            index++;
            seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
            return;
        }

        console.log('*** ', e.account.params.fullName || e.account.params.username, ' ***');

        //Segue no instagram
        Client.Relationship.create(session, e.account.id).then((rel) => {

            console.log('Seguindo');

            //Marca no banco que seguiu
            followProvider.createUser(accountId, e.account.id).then(() => {

                console.log('DB atualizada');

                //Marca a qntde ja seguida
                qtdeJaSeguiu++;

                //Curte a foto
                Client.Like.create(session, e.id).then((like) => {

                    console.log('Foto curtida');
                    console.log('');

                    index++;
                    seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);

                }, (err) => {
                    console.error(err);
                    index++;
                    seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
                });

            }, (err) => {
                console.error(err);
                index++;
                seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
            });

        }, (err) => {
            console.error(err);
            index++;
            seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
        })


    }, (err) => {
        console.error(err);
        index++;
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
    });
}

exports.fixFollowBugs = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();

        const follows = await followProvider.getFollowing(accountId);

        for (let i = 0; i < follows.length; i++) {
            const e = follows[i];

            const rel = await Client.Relationship.get(session, e.userFollowerId);

            console.log(e.userFollowerId);

            if (!rel.params.following) {
                await followProvider.delete(accountId, e.userFollowerId);
                console.log('Remove: ', e.userFollowerId);
            }

        }

        res.status(200).send({
            message: 'Bugs fixed'
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
}

// function fixBugs(accountId) {
//     if (bugs.length == 0) {
//         return;
//     }

//     console.log('Bugs: ', bugs.length);

//     for (let i = 0; i < bugs.length; i++) {
//         const e = bugs[i];

//         if (e.remover) {
//             followProvider.delete(accountId, e.id).then(() => {
//                 console.log('Bug fixed: ', e.id);
//             }, (err) => {
//                 console.error(err);
//             });
//         } else {
//             followProvider.unfollow(accountId, e.id).then(() => {
//                 console.log('Bug fixed: ', e.id);
//             }, (err) => {
//                 console.error(err);
//             });
//         }
//     }
// }