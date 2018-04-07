const TelegramBot = require('node-telegram-bot-api');
const mongoose = require("mongoose");
const config = require('./config');
const helper = require('./helper');
const keyboard = require('./keyboard');
const kb = require('./keyboard-buttons');
let winners = []

helper.logStart();

mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

require('./models/usd.model');
require('./models/user.model');
require('./models/rub.model');
require('./models/btc.model');
require('./models/admin.model');
const User = mongoose.model('users');
const Usd = mongoose.model('usd');
const Rub = mongoose.model('rub');
const Btc = mongoose.model('btc');
const Admin = mongoose.model('admin');
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {

   
    const chatId = helper.getChatId(msg)

    switch (msg.text) {
        case kb.home.usd:
            USD(chatId, msg.from.id)
            break;
        case kb.home.rub:
            RUB(chatId, msg.from.id)
            break;
        case kb.home.btc:
            BTC(chatId, msg.from.id)
            break;
        case kb.home.support:
            bot.sendMessage(msg.from.id, `t.me/sup4u_bot`
                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
            break;
        case kb.usd.back:
            bot.sendMessage(msg.from.id, `<b>👑 Главное меню:</b>`
                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
            break;
        case kb.home.bonus:
            BONUS(msg)
            break;
        case kb.home.news:
            bot.sendMessage(msg.from.id, `<a href="https://t.me/joinchat/AAAAAE6fDSfSe0AZ8T_rYA">Подписывайтесь на наш новостной канал..</a>`, {parse_mode: 'HTML'})

    }
});
//inline_keyboard=====================================

const inline_keyboard = {
    rub: [
    [ {text: '📥 Добавить', callback_data: 'rubadd'},
        {text: '📤 Удалить', callback_data: 'rubdel'}],
    [{text: '+ Депозиты +', callback_data: 'rubdep'},
        {text: '+ Выплаты +', callback_data: 'rubcash'}
    ]
    ],
    usd: [
        [ {text: '📥 Добавить', callback_data: 'usdadd'},
            {text: '📤 Удалить', callback_data: 'usddel'}],
        [{text: '+ Депозиты +', callback_data: 'usddep'},
            {text: '+ Выплаты +', callback_data: 'usdcash'}
        ]
    ],
    btc: [
        [ {text: '📥 Добавить', callback_data: 'btcadd'},
            {text: '📤 Удалить', callback_data: 'btcdel'}],
        [{text: '+ Депозиты +', callback_data: 'btcdep'},
            {text: '+ Выплаты +', callback_data: 'btccash'}
        ]
    ],
    bonus: [
        [ {text: '🤗 Получить', callback_data: 'get'}]
        ]
}
//START====================================================

bot.onText(/\/start/, msg => {

    let userPromise

    User.findOne({tgId: msg.from.id})
        .then(user => {
            if(user) {
                bot.sendMessage(msg.from.id, `🚀 <b>Старт</b> - это хорошо) \n🤠 и снова.. Здравствуйте, <b>${msg.from.first_name}</b>!)`
                    ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'}
                    )
                userPromise = user
            } else {
                userPromise = new User({
                    name: msg.from.first_name,
                    tgId: msg.from.id,

                    allinvr: false,
                    allcashr: false,
                    allprofitr: false,

                    allinvu: false,
                    allcashu: false,
                    allprofitu: false,

                    allinvb: false,
                    allcashb: false,
                    allprofitb: false
                    })


                userPromise.save().then(_ => {
                    bot.sendMessage(msg.from.id, `👋😎 Приветствую Вас, <b>${msg.from.first_name}</b>!`
                        ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'}
                        )
                })
            }
        })
})

//USD USD USD USD USD USD USD USD USD USD USD USD USD USD ===========================================

function USD(chatId, tgId) {
    Promise.all([
        User.findOne({tgId}) ,
        Usd.find({tgId})
    ])
        .then(([user, invest])  => {
          let html
                if (invest.length) {

                 html = invest.map((f, i) => {
                    return `${i + 1}. ${f.statu} <b>${f.projectu}:</b>\n💸 <code>${f.depu}$</code> | 💵 <code>${f.cashu}$</code> | 💰 <code>${f.profitu}$</code>`
                }).join('\n')
        } else {
            html = '🤷‍♂️ <i>Ваш портфель пуст..</i>'
                }
        bot.sendMessage(tgId,`<b>$ 👈😎 Портфель для учета инвестиций в долларах:</b>\n~~~~~~~~~~~~~~~~~~~~\n`+ html+ `\n~~~~~~~~~~~~~~~~~~~~\n<b>Общая статистика:</b>\n💸 ${user.allinvu}$ <code>(инвестировано)</code>\n💵 ${user.allcashu}$ <code>(заработано)</code>\n💰 ${user.allprofitu}$ <code>(профит)</code>`
            , { reply_markup:{inline_keyboard: inline_keyboard.usd} , parse_mode: 'HTML'})

                })}

//callback_query================================================

bot.on('callback_query', query => {
        const userId = query.from.id

    switch (query.data) {
        case 'usdadd':
            usdadd(userId, query.id)
            break;
        case 'usddel':
            usddel(userId, query.id)
            break;
        case 'usddep':
            usddep(userId, query.id)
            break;
        case 'usdcash':
            usdcash(userId, query.id)
            break;
    }})

//USD ADD=================================================

function usdadd(userId) {
    bot.sendMessage(userId, `🤔 <b>Куда инвестируем?</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/usdadd</code> название`,
        {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})}

    bot.onText(/\/usdadd (.+)/, (msg, match) => {
        const chatId = msg.chat.id
        const project = match[1]
        const tgId = msg.from.id
        if(msg.text !== 'Назад'){

            let usdPromise
            Usd.findOne({tgId: tgId,
                projectu: project})
                .then((invest) => {
                    if (invest) {
                        bot.sendMessage(chatId, `🙄 <b>В Вашем портфеле уже есть</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                    }
                        else {
                        usdPromise = new Usd({
                            projectu: project,
                            tgId: msg.from.id
                        })
                        usdPromise.save()
                            .then (invest => {

                            bot.sendMessage(chatId, `👌😎 <b>Вы добавили в портфель:</b> <i>"${invest.projectu}"</i>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
                })}

    })

//USD DEL=================================================
function usddel(chatId) {
    bot.sendMessage(chatId, `😕 <b>Что снести в СКАМ?</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/usddel</code> название`,
        {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}
bot.onText(/\/usddel (.+)/, (msg, match) => {

    const chatId = msg.chat.id
    const project = match[1]
    const tgId = msg.from.id
    if(project !== 'Назад'){
        Usd.findOne({tgId: tgId, projectu: project})
            .then(invest => {
                if(!invest) {
                    bot.sendMessage(chatId, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})}

                else {
                    Promise.all([
                        Usd.findOne({tgId: tgId, projectu: project}),
                        User.findOne({tgId: msg.from.id})
                    ])
                        .then(([invest, user]) => {
                            const sum = +`${user.allinvu}` - +`${invest.depu}`

                            Promise.all([
                                User.findOneAndUpdate({tgId: msg.from.id},
                                    {$set: {allinvu: sum.toFixed(2)}}
                                    ,{returnOriginal: false}),

                                Usd.deleteOne({projectu: project})
                            ]).then(_ => {

                                bot.sendMessage(chatId, `😤 <b>Из портфеля удален:</b> <i>"${project}"</i>`
                                    ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                            })     })}
            })}
})
//USD DEP==========================================
function usddep(userId) {
    bot.sendMessage(userId, `💪 <b>Самое время усилиться!</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/usddep</code> название <code>-</code> сумма`
        ,{reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}

bot.onText(/\/usddep (.+) - (.+)/, (msg, match) => {
    const project = match[1]
    const deposit = match[2]
    const tgId = msg.from.id

    if(msg.text !== 'Назад') {
        Promise.all([
            Usd.findOne({tgId: tgId, projectu: project}),
            User.findOne({tgId: msg.from.id})
            ])
                .then(([invest, user]) => {
                    if(!invest) {
                        bot.sendMessage(msg.from.id, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})
                    }
                        else {
                        const dep = +`${invest.depu}` + +`${deposit}`
                        const profit = +`${invest.profitu}` - +`${deposit}`
                        const alldep = +`${user.allinvu}` + +`${deposit}`
                        const allprofit = +`${user.allprofitu}` - +`${deposit}`
                        let a = false
                        if(invest){a = Math.sign(profit) !== -1}
                        const b = a ? '⭐' : '♻️'
                        Promise.all([
                            Usd.findOneAndUpdate({tgId: tgId, projectu: project},
                                    {$set: {depu: dep.toFixed(2), profitu: profit.toFixed(2), statu: b}}
                                    ,{returnOriginal: false}),
                                User.findOneAndUpdate({tgId: msg.from.id},
                                    {$set: {allinvu: alldep.toFixed(2), allprofitu: allprofit.toFixed(2)}}
                                    ,{returnOriginal: false})
                                ])
                                .then(_ => {
                                    bot.sendMessage(msg.from.id, `👌😎 <b>Балансы подбиты!</b> \n<code>${deposit}$</code> к депозиту в <b>"${project}"</b>`
                                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                                })
                    }}) } })

//USD CASH================================================
function usdcash(userId) {
    bot.sendMessage(userId, `💵🤗 <b>Денежки..</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/usdcash</code> название <code>-</code> сумма`
        , {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}

bot.onText(/\/usdcash (.+) - (.+)/, (msg, match) => {

    const project = match[1]
    const summa = match[2]
    const tgId = msg.from.id

    if(msg.text !== 'Назад') {
        Promise.all([
            Usd.findOne({tgId: tgId, projectu: project}),
            User.findOne({tgId: msg.from.id})
        ])
            .then(([invest, user]) => {

                if(!invest) {
                    bot.sendMessage(msg.from.id, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})}
                else {
                    const sum = +`${invest.cashu}` + +`${summa}`
                    const profit = +`${invest.profitu}` + +`${summa}`
                    const allcash = +`${user.allcashu}` + +`${summa}`
                    const allprofit = +`${user.allprofitu}` + +`${summa}`
                    let a = false
                    if(invest){a = Math.sign(profit) !== -1}
                    const b = a ? '⭐' : '♻️'

                    Promise.all([
                        Usd.findOneAndUpdate({tgId: tgId, projectu: project},
                            {$set: {cashu: sum.toFixed(2), profitu: profit.toFixed(2), statu: b}}
                            ,{returnOriginal: false}),

                        User.findOneAndUpdate({tgId: msg.from.id},
                            {$set: {allcashu: allcash.toFixed(2), allprofitu: allprofit.toFixed(2)}}
                            ,{returnOriginal: false})
 ])
.then(([invest, user]) => {
                        bot.sendMessage(msg.from.id, `👌😎 <b>Балансы подбиты!</b> \n<code>${summa}$</code> к выплатам в <b>"${project}"</b>`
                                , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                        })
                }}) } });

//RUB RUB RUB RUB RUB RUB RUB RUB RUB RUB RUB RUB
//=================================================

function RUB(chatId, tgId) {
    Promise.all([
        User.findOne({tgId}) ,
        Rub.find({tgId})
    ])
        .then(([user, invest])  => {
           let html
            if (invest.length) {
        html = invest.map((f, i) => {
                    return `${i + 1}. ${f.stat} <b>${f.project}:</b>\n💸 <code>${f.dep}₽</code> | 💵 <code>${f.cash}₽</code> | 💰 <code>${f.profit}₽</code>`
                }).join('\n')
            } else {
                html = '🤷‍♂️ <i>Ваш портфель пуст..</i>'
            }
            bot.sendMessage(tgId,`<b>₽ 👈😎 Портфель для учета инвестиций в рублях:</b>\n~~~~~~~~~~~~~~~~~~~~\n`+ html+ `\n~~~~~~~~~~~~~~~~~~~~\n<b>Общая статистика:</b>\n💸 ${user.allinvr}₽ <code>(инвестировано)</code>\n💵 ${user.allcashr}₽ <code>(заработано)</code>\n💰 ${user.allprofitr}₽ <code>(профит)</code>`
                , { reply_markup:{inline_keyboard: inline_keyboard.rub} , parse_mode: 'HTML'})

        })}

//callback_query================================================

bot.on('callback_query', query => {
    const userId = query.from.id

    switch (query.data) {
        case 'rubadd':
            rubadd(userId, query.id)
            break;
        case 'rubdel':
            rubdel(userId, query.id)
            break;
        case 'rubdep':
            rubdep(userId, query.id)
            break;
        case 'rubcash':
            rubcash(userId, query.id)
            break;
    }})




//RUB ADD=================================================

function rubadd(userId) {
    bot.sendMessage(userId, `🤔 <b>Куда инвестируем?</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/rubadd</code> название`,
        {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/rubadd (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const project = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){

        let investPromise
        Rub.findOne({tgId: tgId, project: project})
            .then((invest) => {
                if (invest) {
                    bot.sendMessage(chatId, `🙄 <b>В Вашем портфеле уже есть</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    investPromise = new Rub({
                        project: project,
                        tgId: msg.from.id
                    })
                    investPromise.save()
                        .then (invest => {
                            console.log("Сохранен проект", invest)
                            bot.sendMessage(chatId, `😎👍 <b>Вы добавили в портфель:</b> <i>"${invest.project}"</i>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})



//RUB DEL=================================================

function rubdel(chatId) {
    bot.sendMessage(chatId, `😕 <b>Что снести в СКАМ?</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/rubdel</code> название`,
        {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}
bot.onText(/\/rubdel (.+)/, (msg, match) => {

    const chatId = msg.chat.id
    const project = match[1]
    const tgId = msg.from.id
    if(project !== 'Назад'){
        Rub.findOne({tgId: tgId, project: project})
            .then(invest => {
                if(!invest) {
                    bot.sendMessage(chatId, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})}

                else {
                    Promise.all([
                        Rub.findOne({tgId: tgId, project: project}),
                        User.findOne({tgId: msg.from.id})
                    ])
                        .then(([invest, user]) => {
                            const sum = +`${user.allinvr}` - +`${invest.dep}`

                            Promise.all([
                                User.findOneAndUpdate({tgId: msg.from.id},
                                    {$set: {allinvr: sum.toFixed(2)}}
                                    ,{returnOriginal: false}),

                                Rub.deleteOne({project: project})
                            ]).then(_ => {

                                bot.sendMessage(chatId, `😤 <b>Из портфеля удален:</b> <i>"${project}"</i>`
                                    ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                            })     })}
            })}
})
//RUB DEP==========================================
function rubdep(userId) {
    bot.sendMessage(userId, `💪 <b>Самое время усилиться!</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/rubdep</code> название <code>-</code> сумма`
        ,{reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}

bot.onText(/\/rubdep (.+) - (.+)/, (msg, match) => {
    const project = match[1]
    const deposit = match[2]
    const tgId = msg.from.id

    if(msg.text !== 'Назад') {
        Promise.all([
            Rub.findOne({tgId: tgId, project: project}),
            User.findOne({tgId: msg.from.id})
        ])
            .then(([invest, user]) => {
                if(!invest) {
                    bot.sendMessage(msg.from.id, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})
                }
                else {
                    const dep = +`${invest.dep}` + +`${deposit}`
                    const profit = +`${invest.profit}` - +`${deposit}`
                    const alldep = +`${user.allinvr}` + +`${deposit}`
                    const allprofit = +`${user.allprofitr}` - +`${deposit}`
                    let a = false
                    if(invest){a = Math.sign(profit) !== -1}
                    const b = a ? '⭐' : '♻️'
                    Promise.all([
                        Rub.findOneAndUpdate({tgId: tgId, project: project},
                            {$set: {dep: dep.toFixed(2), profit: profit.toFixed(2), stat: b}}
                            ,{returnOriginal: false}),
                        User.findOneAndUpdate({tgId: msg.from.id},
                            {$set: {allinvr: alldep.toFixed(2), allprofitr: allprofit.toFixed(2)}}
                            ,{returnOriginal: false})
                    ])
                        .then(([invest, user]) => {
                            bot.sendMessage(msg.from.id, `👌😎 <b>Балансы подбиты!</b> \n<code>${deposit}₽</code> к депозиту в <b>"${project}"</b>`
                                , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                        })
                }}) } })

//RUB CASH================================================
function rubcash(userId) {
    bot.sendMessage(userId, `💵🤗 <b>Денежки..</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/rubcash</code> название <code>-</code> сумма`
        , {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}

bot.onText(/\/rubcash (.+) - (.+)/, (msg, match) => {

    const project = match[1]
    const summa = match[2]
    const tgId = msg.from.id

    if(msg.text !== 'Назад') {
        Promise.all([
            Rub.findOne({tgId: tgId, project: project}),
            User.findOne({tgId: msg.from.id})
        ])
            .then(([invest, user]) => {

                if(!invest) {
                    bot.sendMessage(msg.from.id, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})}
                else {
                    const sum = +`${invest.cash}` + +`${summa}`
                    const profit = +`${invest.profit}` + +`${summa}`
                    const allcash = +`${user.allcashr}` + +`${summa}`
                    const allprofit = +`${user.allprofitr}` + +`${summa}`
                    let a = false
                    if(invest){a = Math.sign(profit) !== -1}
                    const b = a ? '⭐' : '♻️'

                    Promise.all([
                        Rub.findOneAndUpdate({tgId: tgId, project: project},
                            {$set: {cash: sum.toFixed(2), profit: profit.toFixed(2), stat: b}}
                            ,{returnOriginal: false}),

                        User.findOneAndUpdate({tgId: msg.from.id},
                            {$set: {allcashr: allcash.toFixed(2), allprofitr: allprofit.toFixed(2)}}
                            ,{returnOriginal: false})

                    ])

                        .then(([invest, user]) => {
    bot.sendMessage(msg.from.id, `👌😎 <b>Балансы подбиты!</b> \n<code>${summa}₽</code> к выплатам в <b>"${project}"</b>`
                                , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                        })
                }}) } });

//BTC BTC BTC BTC BTC BTC

function BTC(chatId, tgId) {
    Promise.all([
        User.findOne({tgId}) ,
        Btc.find({tgId})
    ])
        .then(([user, invest])  => {
            let html
            if (invest.length) {
                html = invest.map((f, i) => {
                    return `${i + 1}. ${f.stat} <b>${f.project}:</b>\n💸 <code>${f.dep}฿</code> | 💵 <code>${f.cash}฿</code> | 💰 <code>${f.profit}฿</code>`
                }).join('\n')
            } else {
                html = '🤷‍♂️ <i>Ваш портфель пуст..</i>'
            }
            bot.sendMessage(tgId,`<b>฿ 👈😎 Портфель для учета инвестиций в биткоинах:</b>\n~~~~~~~~~~~~~~~~~~~~\n`+ html+ `\n~~~~~~~~~~~~~~~~~~~~\n<b>Общая статистика:</b>\n💸 ${user.allinvb}฿ <code>(инвестировано)</code>\n💵 ${user.allcashb}฿ <code>(заработано)</code>\n💰 ${user.allprofitb}฿ <code>(профит)</code>`
                , { reply_markup:{inline_keyboard: inline_keyboard.btc} , parse_mode: 'HTML'})

        })}

//callback_query================================================

bot.on('callback_query', query => {
    const userId = query.from.id

    switch (query.data) {
        case 'btcadd':
            btcadd(userId, query.id)
            break;
        case 'btcdel':
            btcdel(userId, query.id)
            break;
        case 'btcdep':
            btcdep(userId, query.id)
            break;
        case 'btccash':
            btccash(userId, query.id)
            break;
    }})




//BTC ADD=================================================

function btcadd(userId) {
    bot.sendMessage(userId, `🤔 <b>Куда инвестируем?</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/btcadd</code> название`,
        {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/btcadd (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const project = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){

        let investPromise
        Btc.findOne({tgId: tgId, project: project})
            .then((invest) => {
                if (invest) {
                    bot.sendMessage(chatId, `🙄 <b>В Вашем портфеле уже есть</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    investPromise = new Btc({
                        project: project,
                        tgId: msg.from.id
                    })
                    investPromise.save()
                        .then (invest => {
                            console.log("Сохранен проект", invest)
                            bot.sendMessage(chatId, `😎👍 <b>Вы добавили в портфель:</b> <i>"${invest.project}"</i>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})



//BTC DEL=================================================

function btcdel(chatId) {
    bot.sendMessage(chatId, `😕 <b>Что снести в СКАМ?</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/btcdel</code> название`,
        {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}
bot.onText(/\/btcdel (.+)/, (msg, match) => {

    const chatId = msg.chat.id
    const project = match[1]
    const tgId = msg.from.id
    if(project !== 'Назад'){
        Btc.findOne({tgId: tgId, project: project})
            .then(invest => {
                if(!invest) {
                    bot.sendMessage(chatId, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})}

                else {
                    Promise.all([
                        Btc.findOne({tgId: tgId, project: project}),
                        User.findOne({tgId: msg.from.id})
                    ])
                        .then(([invest, user]) => {
                            const sum = +`${user.allinvb}` - +`${invest.dep}`

                            Promise.all([
                                User.findOneAndUpdate({tgId: msg.from.id},
                                    {$set: {allinvb: sum.toFixed(2)}}
                                    ,{returnOriginal: false}),

                                Btc.deleteOne({project: project})
                            ]).then(_ => {

                                bot.sendMessage(chatId, `😤 <b>Из портфеля удален:</b> <i>"${project}"</i>`
                                    ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                                if(err) return console.log(err)
                            })     })}
            })}
})
//BTC DEP==========================================
function btcdep(userId) {
    bot.sendMessage(userId, `💪 <b>Самое время усилиться!</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/btcdep</code> название <code>-</code> сумма`
        ,{reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}

bot.onText(/\/btcdep (.+) - (.+)/, (msg, match) => {
    const project = match[1]
    const deposit = match[2]
    const tgId = msg.from.id

    if(msg.text !== 'Назад') {
        Promise.all([
            Btc.findOne({tgId: tgId, project: project}),
            User.findOne({tgId: msg.from.id})
        ])
            .then(([invest, user]) => {
                if(!invest) {
                    bot.sendMessage(msg.from.id, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})
                }
                else {
                    const dep = +`${invest.dep}` + +`${deposit}`
                    const profit = +`${invest.profit}` - +`${deposit}`
                    const alldep = +`${user.allinvb}` + +`${deposit}`
                    const allprofit = +`${user.allprofitb}` - +`${deposit}`
                    let a = false
                    if(invest){a = Math.sign(profit) !== -1}
                    const b = a ? '⭐' : '♻️'
                    Promise.all([
                        Btc.findOneAndUpdate({tgId: tgId, project: project},
                            {$set: {dep: dep.toFixed(2), profit: profit.toFixed(2), stat: b}}
                            ,{returnOriginal: false}),
                        User.findOneAndUpdate({tgId: msg.from.id},
                            {$set: {allinvb: alldep.toFixed(2), allprofitb: allprofit.toFixed(2)}}
                            ,{returnOriginal: false})
                    ])
                        .then(([invest, user]) => {
                            bot.sendMessage(msg.from.id, `👌😎 <b>Балансы подбиты!</b> \n<code>${deposit}฿</code> к депозиту в <b>"${project}"</b>`
                                , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                        })
                }}) } })

//btc CASH================================================
function btccash(userId) {
    bot.sendMessage(userId, `💵🤗 <b>Денежки..</b>\n<i>Отправьте сообщение вида:</i>\n\n<code>/btccash</code> название <code>-</code> сумма`
        , {reply_markup: {keyboard: keyboard.usd, resize_keyboard: true},parse_mode: 'HTML'})
}

bot.onText(/\/btccash (.+) - (.+)/, (msg, match) => {

    const project = match[1]
    const summa = match[2]
    const tgId = msg.from.id

    if(msg.text !== 'Назад') {
        Promise.all([
            Btc.findOne({tgId: tgId, project: project}),
            User.findOne({tgId: msg.from.id})
        ])
            .then(([invest, user]) => {

                if(!invest) {
                    bot.sendMessage(msg.from.id, `🕵️ <b>В Вашем портфеле нет</b> <i>"${project}"</i>.\n<code>повторите действие заново..</code>`,{parse_mode: 'HTML'})}
                else {
                    const sum = +`${invest.cash}` + +`${summa}`
                    const profit = +`${invest.profit}` + +`${summa}`
                    const allcash = +`${user.allcashb}` + +`${summa}`
                    const allprofit = +`${user.allprofitb}` + +`${summa}`
                    let a = false
                    if(invest){a = Math.sign(profit) !== -1}
                    const b = a ? '⭐' : '♻️'


                    Promise.all([
                        Btc.findOneAndUpdate({tgId: tgId, project: project},
                            {$set: {cash: sum.toFixed(2), profit: profit.toFixed(2), stat: b}}
                            ,{returnOriginal: false}),

                        User.findOneAndUpdate({tgId: msg.from.id},
                            {$set: {allcashb: allcash.toFixed(2), allprofitb: allprofit.toFixed(2)}}
                            ,{returnOriginal: false})

                    ])

                        .then(([invest, user]) => {
                            bot.sendMessage(msg.from.id, `👌😎 <b>Балансы подбиты!</b> \n<code>${summa}฿</code> к выплатам в <b>"${project}"</b>`
                                , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                        })
                }}) } });
//BONUS=====================================================

function BONUS(msg) {

    User.findOne({tgId: msg.from.id})
        .then(user => {
            bot.sendMessage(msg.from.id,`😋 <b>В Вашей корзинке:</b> ${user.bonus} 🍩\n\n<i>100 🍩 = $1 USD</i>`, {parse_mode: 'HTML'})

        })}


bot.onText(/\/bonus (.+) (.+)/, (msg, match) => {

    const bonus = match[1]
    const bon = match[2]
    winners.length = 0
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin){
                Promise.all
                ([
                    User.updateMany({bon: '1'},
                        {$set: {bon: '0'}}),
                    Admin.findOneAndUpdate({tgId: '184670517'},
                        {$set: {bon: bon, bonus: bonus, win: winners}}
                        ,{returnOriginal: false}
                    )
                ]).then(([user, adm]) => {

                    bot.sendMessage(-1001319046439, `😋 Плюшки 🍩🍩🍩`,
                        { reply_markup:{inline_keyboard: inline_keyboard.bonus} , parse_mode: 'HTML'}
                    )
                })
            }

        })

}	)

bot.on('callback_query', query => {
    const userId = query.from.id
    switch (query.data) {
        case 'get':
            get(userId)
            break;
    }
})

function get(userId) {
    User.findOne({tgId: userId})
        .then(user => {
            if(user){

                Promise.all([
                    User.findOne({tgId: userId}),
                    Admin.findOne({tgId: '184670517'})
                ]).then(([user, admin]) => {

                    if(user.bon === 0 && admin.bonus > 0) {
                        let abonus = +`${admin.bonus}` - +`${admin.bon}`
                            let ubonus = +`${user.bonus}` + +`${admin.bon}`

                            winners.push(user.name)
                      
                        Promise.all
                        ([
                            Admin.findOneAndUpdate({tgId: '184670517'},
                                {$set: {bonus: abonus, win: winners}}),
                            User.findOneAndUpdate({tgId: user.tgId},
                                {$set: {bon: '1', bonus: ubonus}}
                            )
                        ]).then(([admin, user]) => {

                            bot.sendMessage(userId, `😋 Поздравляю! Вы получили ${admin.bon} 🍩`)

                        })
                    }
                    else {
                        bot.sendMessage(userId, '🚫 Бонус не доступен')
                    }
                })
            }}
        )
}

bot.onText(/\/win/, msg => {
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin){
                if(admin.bonus === 0) {
                    bot.sendMessage(-1001319046439, `🎊 <b>Раздача бонусов завершена! Плюшки получили:</b> \n\n${admin.win}`, {parse_mode: 'HTML'})

                }
                else {
                    bot.sendMessage(msg.from.id, `${admin}`)}

            }
            
        })
})
//======================================================================================



             
//RESET===================================
bot.onText(/\/resetrub/, (msg) => {
    Promise.all([
        User.findOneAndUpdate({tgId: msg.from.id},
            {$set: {allinvr: '0', allcashr: '0', allprofitr: '0'}}),
        Rub.remove({tgId: msg.from.id})
    ]).then(_ => {
           bot.sendMessage(msg.from.id, 'Все данные портфеля <b>"💼 RUB"</b> удалены!'
               ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
            })
        });

bot.onText(/\/resetusd/, (msg) => {
    Promise.all([
        User.findOneAndUpdate({tgId: msg.from.id},
            {$set: {allinvu: '0', allcashu: '0', allprofitu: '0'}}),
        Usd.remove({tgId: msg.from.id})
    ]).then(_ => {
        bot.sendMessage(msg.from.id, 'Все данные портфеля <b>"💼 USD"</b> удалены!'
            ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
    })
});

bot.onText(/\/resetbtc/, (msg) => {
    Promise.all([
        User.findOneAndUpdate({tgId: msg.from.id},
            {$set: {allinvb: '0', allcashb: '0', allprofitb: '0'}}),
        Btc.remove({tgId: msg.from.id})
    ]).then(_ => {
        bot.sendMessage(msg.from.id, 'Все данные портфеля <b>"💼 BTC"</b> удалены!'
            ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
    })
});
//RESET===================================

