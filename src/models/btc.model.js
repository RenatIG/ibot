const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BtcSchema = new Schema({
        project: {type: String, required: true},
        tgId: {type: Number, required: true},

        dep: {type: Number, default: 0},
        cash: {type: Number, default: 0},
        profit: {type: Number, default: 0},
        stat: {type: String, default: '📌'}

    },
    {versionKey: false});

mongoose.model('btc', BtcSchema)