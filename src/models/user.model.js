const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
        name: String,
        tgId: {type: Number, required: true},
        bon: {type: Number, default: 0},
        bonus: {type: Number, default: 0},
        cashout: {type: Number, default: 0},

        allinvu: {type: Number, default: 0},
        allcashu: {type: Number, default: 0},
        allprofitu: {type: Number, default: 0},

        allinvr: {type: Number, default: 0},
        allcashr: {type: Number, default: 0},
        allprofitr: {type: Number, default: 0},

        allinvb: {type: Number, default: 0},
        allcashb: {type: Number, default: 0},
        allprofitb: {type: Number, default: 0}

    },
    { versionKey: false });

mongoose.model('users', UserSchema)