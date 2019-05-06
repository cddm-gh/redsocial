const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FollowSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    followed: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Follow', FollowSchema);