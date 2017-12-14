var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var followSchema = new Schema({
    userId: { type: Number, required: true },
    userFollowerId: { type: Number, required: true },
    following: { type: Boolean, required: true },
    followAt: { type: Date, required: false },
    unfollowAt: { type: Date, required: false },
});

// followSchema.pre('save', (next) => {
//     if (!this.followAt) {
//         this.followAt = new Date();
//     }
//     next();
// });

var Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;