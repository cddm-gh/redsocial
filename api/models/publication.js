const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PublicationSchema = new Schema({

    text: {
        type: String,
        required: [true, 'El texto es necesario']
    },
    file: {
        type: String
    },
    created_at: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Publication', PublicationSchema);