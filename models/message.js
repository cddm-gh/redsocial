const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MessageSchema = new Schema({

    text: String,
    created_at: String,
    viewed: Boolean,
    emitter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Message', MessageSchema);