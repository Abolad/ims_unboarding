const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
require('dotenv').config




const authorization = async (req,res,next)=>{
    try{

        const hasAuthorization = req.headers.authorization

        if(!hasAuthorization){
            return res.status(400).json({
                error:"Authorization token not found"
            })
        }

        const token = hasAuthorization.split(" ")[1]

        if(!token){
            return res.status(400).json({
                error: "Authorization not found"
            })
        }

        const decodeToken = jwt.verify(token, process.env.jwtSecret)

        const user = await userModel.findById(decodeToken.agentId)
        console.log(user)
     


        if(!user){
            return res.status(404).json({
                error: "Authorization failed: user not found" 
            })
        }

        req.user = decodeToken;
        next()

    }catch(error){

        // if(error instanceof jwt.JsonWebTokenError){
        //     return res.json({
        //         message: "session Timeout"
        //     })
        // }

        res.status(500).json({
            error:error.message
        })
    }
}



module.exports = authorization