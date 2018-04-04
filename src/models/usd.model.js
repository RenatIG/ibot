const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UsdSchema = new Schema({
        projectu: {type: String, required: true},
        tgId: {type: Number, required: true},

        depu: {type: Number, default: 0},
        cashu: {type: Number, default: 0},
        profitu: {type: Number, default: 0},
        statu: {type: String, default: '📌'}

    },
    {versionKey: false});

mongoose.model('usd', UsdSchema)