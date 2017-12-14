var Client = require('instagram-private-api').V1;
var _ = require('lodash');
var Promise = require('bluebird');
var followProvider = require('./follow-provider');

exports.followEndLikeByLocation = async (req, res, next) => {

    try {

        const session = req.session;
        const accountId = await session.getAccountId();
        const feed = new Client.Feed.LocationMedia(session, req.body.locationId, 5);

        let qtdeJaSeguiu = 0;

        for (let data = await feed.get(); feed.isMoreAvailable(); data = await feed.get()) {
            const element = data;
            
        }

        // feed.on('data', (data) => seguir(data, accountId, qtdeJaSeguiu, req.body.amountOfFollow));

        // feed.on('end', (data) => res.status(200).send());

        // feed.all();

    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function seguir(data, accountId, qtdeJaSeguiu, qtdeSeguir) {

    //Se já seguiu a qtde solicitada para a execução
    if (qtdeJaSeguiu >= qtdeSeguir) {
        feed.stop();
        return;
    }

    //Percorre os resultados
    for (let i = 0; i < data.length; i++) {
        const e = data[i];

        //Se já seguiu a qtde solicitada para a execução
        if (qtdeJaSeguiu >= qtdeSeguir) {
            feed.stop();
            return;
        }

        //Se ja segue pula pro proximo
        if (e.account.params.friendshipStatus.following) {
            continue;
        }

        //Se ja seguiu algum dia pula pro proximo.
        const following = await followProvider.followedOnce(accountId, e.account.id);
        if(following) {
            continue;
        }

        // followProvider.followedOnce(accountId, e.account.id).then((following) => {

        //     //Se ja seguiu algum dia pula pro proximo.
        //     if (following) return;

        //     //Cria o vinculo no banco de dados
        //     followProvider.createUser(accountId, e.account.id).then(() => {

        //         //Segue no instagram

        //         //Marca a qntde ja seguida
        //         qtdeJaSeguiu++;

        //         //Curte as fotos

        //     });
        // });
    }
}