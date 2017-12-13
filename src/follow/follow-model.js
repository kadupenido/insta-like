var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var followSchema = new Schema({
    userId: { type: Number, required: true },
    userFollowerId: { type: Number, required: true },
    following: { type: Boolean, required: true },
    followAt: { type: Date, required: true },
    unfollowAt: { type: Date, required: true },
});

followSchema.pre('save', (next) => {
    if (!this.unfollowAt) {
        this.unfollowAt = new Date();
    }
    next();
});

var Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;