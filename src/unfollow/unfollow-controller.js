var Client = require("instagram-private-api").V1;
var followProvider = require("../follow/follow-provider");


exports.unfollow = async (req, res, next) => {
    try {
        const session = req.session;
        const accountId = req.accountId
        const follows = await followProvider.getFollowing(accountId);

        const userFollowerId = req.body.userFollowerId;
        const followedBy = req.body.followedBy;

        //Se nao informar quem deve deixar de seguir
        if (!userFollowerId) {
            res.status(400).send({
                success: false,
                message: 'O usuário para dar unfollow não foi informado'
            });
            return;
        }

        //Busca a amizade
        Client.Relationship.get(session, userFollowerId).then((rel) => {

            //Remove possiveis bugs
            if (!rel.params.following) {

                followProvider.unfollow(accountId, userFollowerId).then(() => {
                    res.status(200).send({ success: true });

                }, (err) => {
                    res.status(500).send({ success: false, message: err.message || err });
                });

                return;
            }

            //Checa se deve dar unfollow
            if (followedBy && !rel.params.followed_by) {
                res.status(200).send({ success: true });
                return;
            }

            //Da unfollow no instagram
            Client.Relationship.destroy(session, userFollowerId).then((relStatus) => {

                //Atualiza o banco
                followProvider.unfollow(accountId, userFollowerId).then(() => {
                    res.status(200).send({ success: true });

                }, (err) => {
                    res.status(500).send({ success: false, message: err.message || err });
                });

            }, (err) => {
                res.status(500).send({ success: false, message: err.message || err });
            });

        }, (err) => {
            res.status(500).send({ success: false, message: err.message || err });
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
};