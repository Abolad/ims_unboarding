const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")

require("dotenv").config()



const authenticate = async (req,res,next)=>{
    try{

        const hasAuthorization = req.headers.authorization

        if(!hasAuthorization){
            return res.status(400).json({
                error:"Authorization token not inputted"
            })
        }

        const token = hasAuthorization.split(" ")[1]

        if(!token){
            return res.status(400).json({
                error: "Authorization not found"
            })
        }

        const decodeToken = jwt.verify(token, process.env.jwtSecret)

        const user = await userModel.findById(decodeToken.userId)
        // console.log(user)
        const check = user.blackList.includes(token);

        if(check){
            return res.status(400).json({
                error: "user logged Out"
            })
        }


        if(!user){
            return res.status(404).json({
                error: "Authorization failed: not an user" 
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



module.exports = authenticate