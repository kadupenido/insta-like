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
        console.log('Fim da solicitação')
        res.status(200).send();
        return;
    }

    //Se não tiver mais dados suficientes, busca mais
    if (index >= data.length) {

        console.log('Buscando mais dados');

        try {

            if (!feed.isMoreAvailable()) {

                console.log('Fim dos dados');

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
        console.log('*** ', e.account.params.fullname || e.account.params.username, ' ***');
        console.log('');
        index++;
        seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
        return;
    }

    followProvider.followedOnce(accountId, e.account.id).then((following) => {

        //Se ja seguiu algum dia pula pro proximo.
        if (following) {
            console.log('BUG: ', e.account.params.fullname || e.account.params.username, ' (',  e.account.id, ')');
            console.log('');
            index++;
            seguir(session, res, feed, data, index, accountId, qtdeJaSeguiu, qtdeSeguir);
            return;
        }

        console.log('*** ', e.account.params.fullname || e.account.params.username, ' ***');

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