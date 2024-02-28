const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    businessName:{
        type:String
    },
    email:{
        type:String,
        unique:[true,'email already exist']
    },
    password:{
        type:String
    },
    phoneNumber:{
        type:String,
        unique:[true,'phoneNumber already exist']
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
},{timestamps:true})

const userModel = mongoose.model('user',userSchema)

module.exports = userModel