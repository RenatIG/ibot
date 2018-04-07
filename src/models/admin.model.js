const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema = new Schema({
        name: String,
        tgId: {type: Number, default: '184670517'},
        msg: {type: [String], default: []},
        bon: {type: Number, default: 0},
        bonus: {type: Number, default: 0},
        win: {type: [String], default: []}
    },
    { versionKey: false });

mongoose.model('admin', AdminSchema)
