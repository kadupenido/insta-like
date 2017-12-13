exports.getMyInfo = async (req, res, next) => {

    var user = await req.session.getAccount();

    res.status(200).send(user.params);
}