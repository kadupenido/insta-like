var Follow = require('./follow-model');

exports.createUser = (userId, userFollowerId) => {

    const newUser = Follow({
        userId: userId,
        userFollowerId: userFollowerId,
        following: true,
        followAt: new Date()
    });

    return newUser.save((err) => {
        if (err) throw err;
    });
}

exports.followedOnce = async (userId, userFollowerId) => {
    return await Follow.findOne({ userId: userId, userFollowerId: userFollowerId }, (err, follow) => {
        if (err) throw err;

        return follow;
    });
}