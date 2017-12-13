var Follow = require('./follow-model');

exports.createUser = (userId, userFollowerId) => {
    const newUser = Follow({
        userId: userId,
        userFollowerId: userFollowerId,
        following: true
    });

    return newUser.save((err) => {
        if (err) throw err;
    });
}

exports.followedOnce = (userId, userFollowerId) => {
    return User.find({ userId: userId, userFollowerId: userFollowerId }, (err, follow) => {
        if (err) throw err;

        return follow;
    });
}