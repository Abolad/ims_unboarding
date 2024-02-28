const joi = require('joi')

const validation=joi.object({
    businessName:joi.string().min(3).max(50),
    email:joi.string().email(),
    phoneNumber:joi.string().pattern(new RegExp('^[0-9]')).min(5).max(13),
    password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    
})

module.exports = validation