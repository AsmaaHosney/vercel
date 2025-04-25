const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    blacklistedAt: {
        type: Date,
        default: Date.now,
    },
});

const BlacklistTokenModel = mongoose.model(
    'Black_list_Tokens',
    BlacklistSchema
);
module.exports = BlacklistTokenModel;
