const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.usd, kb.home.news],
        [kb.home.rub, kb.home.bonus],
        [kb.home.btc, kb.home.support]
    ],
    usd: [

        [kb.usd.back]
    ],
    admin: [
        [kb.admin.msg],
        [kb.usd.back]
    ]
}

