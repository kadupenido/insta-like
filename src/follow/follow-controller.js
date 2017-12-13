var Client = require('instagram-private-api').V1;
var _ = require('lodash');
var Promise = require('bluebird');
var followProvider = require('./follow-provider');

exports.followEndLikeByLocation = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();
        const feed = new Client.Feed.LocationMedia(session, req.body.locationId, 1000);

        let qtdeJaSeguiu = 0;

        feed.on('data', (data) => {

            //Percorre os resultados
            data.forEach(e => {

                //Se já seguiu a qtde solicitada para a execução
                if(qtdeJaSeguiu >= req.body.amountOfFollow){
                    feed.stop();
                    return;
                }

                //Se ja segue pula pro proximo
                if (e.account.params.friendshipStatus.following) {
                    return;
                }

                try {

                    //Se ja seguiu algum dia pula pro proximo.
                    if (followProvider.followedOnce(accountId, e.account.id)) {
                        return;
                    }

                    //Cria o vinculo no banco de dados
                    followProvider.createUser(accountId, e.account.id);

                    //Segue no instagram

                    //Marca a qntde ja seguida
                    qtdeJaSeguiu++;

                    //Curte as fotos

                } catch (error) {
                    console.error(error);
                }
            });
        });

        feed.on('end', (data) => {
            res.status(200).send();
        })

        feed.all();

    } catch (error) {
        res.status(500).send(error.message);
    }
}