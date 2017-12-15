var Client = require('instagram-private-api').V1;
var _ = require('lodash');
var Promise = require('bluebird');
var followProvider = require('./follow-provider');

exports.followEndLikeByLocation = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();
        const feed = new Client.Feed.LocationMedia(session, req.body.locationId, 1000);

        const qtdeSeguir = req.body.amountOfFollow;
        const qtdeFotosCurtir = req.body.mediaLike;
        let qtdeJaSeguiu = 0;
        let index = 0;


        let data = await feed.get();
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);

    } catch (error) {
        res.status(500).send(error.message);
    }
}

function seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir) {

    //Se já seguiu a qtde solicitada para a execução
    if (qtdeJaSeguiu >= qtdeSeguir) {
        res.status(200).send();
        return;
    }

    //Se não tiver mais dados suficientes, busca mais
    if (index >= data.length) {
        feed.get().then((newData) => {
            data = newData;
            index = 0;
            seguir(session, res, feed, data, index++, accountId, qtdeJaSeguiu, qtdeSeguir);
        }, (err) => {
            console.error(err);
            res.status(500).send(err);
        });

        return;
    }

    const e = data[index];

    //Se ja segue pula pro proximo
    if (e.account.params.friendshipStatus.following) {
        index++;
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
        return;
    }


    followProvider.followedOnce(accountId, e.account.id).then((following) => {

        //Se ja seguiu algum dia pula pro proximo.
        if (following) {
            index++;
            seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
            return;
        }

        //Segue no instagram
        Client.Relationship.create(session, e.account.id).then((rel) => {

            console.log(rel);

            //Marca no banco que seguiu
            followProvider.createUser(accountId, e.account.id).then(() => {

                //Marca a qntde ja seguida
                qtdeJaSeguiu++;

                //Curte as fotos
                //if(qtdeFotosCurtir >)

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
        })


    }, (err) => {
        console.error(err);
        index++;
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
    });
}