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

        return true;
    });
}

exports.followedOnce = async (userId, userFollowerId) => {
    return await Follow.findOne({ userId: userId, userFollowerId: userFollowerId }, (err, follow) => {
        if (err) throw err;

        return follow;
    });
}

exports.getFollowing = async (userId) => {

    return await Follow.find({ userId: userId, following: true }, (err, follow) => {
        if (err) throw err;

        return follow;
    });

}

exports.delete = async (userId, userFollowerId) => {

    return await Follow.findOneAndRemove({ userId: userId, userFollowerId: userFollowerId }, (err) => {
        if (err) throw err;
    });
}

exports.unfollow = async (userId, userFollowerId) => {
    return await Follow.findOneAndUpdate({ userId: userId, userFollowerId: userFollowerId }, { $set: { following: false } }, (err) => {
        if (err) throw err;
    });
}