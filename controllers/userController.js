const userModel = require('../models/userModel')
const validation = require('../middleware/validation')
const bcrypt = require('bcrypt')
const sendEmail=require('../helper/email')
require('dotenv').config()
const jwt =require('jsonwebtoken')
const generateDynamicEmail = require('../html')

exports.signUp = async (req, res) => {
    try {
        const data = {
            businessName: req.body.businessName,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        };

        await validation.validateAsync(data);

        const userExists = await userModel.findOne({ email: data.email });

        if (userExists) {
            return res.status(400).json({
                message: `User with this email already exists.`
            });
        }

        const salt = bcrypt.genSaltSync(11);
        const hash = bcrypt.hashSync(data.password, salt);

        const user = await userModel.create({
            businessName: data.businessName,
            email: data.email,
            password: hash,
            phoneNumber: data.phoneNumber
        });
       
        const token = jwt.sign({
            userId:user._id,
            email:user.email
        }, process.env.SECRET, {expiresIn:'5m'})
        
        await user.save()


         // Sending a verification email to the agent

         const subject = 'Kindly verify your account';
         const link = `${req.protocol}://${req.get('host')}/api/verify/${user._id}`;
         const html = generateDynamicEmail(link, user.businessName.toUpperCase().slice(0, user.businessName.indexOf(" ")));
         await sendEmail({
             email: user.email,
             subject,
             html
         });

        res.status(201).json({
            message: `User with email ${user.email} created successfully.`,
            token,
            user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


exports.Login = async (req,res)=>{
    try {
        const {email,password}= req.body
        const userExist= await userModel.findOne({email})
         if(!userExist){
            return res.status(401).json({
                message:`user not found`
            })
         }
         if(!userExist.isVerified){
            return res.status(400).json({
              error:`Please Verify your account through the link sent to ${userExist.email}`,
            });
        }

         const checkpassword=bcrypt.compareSync(password,userExist.password)
         if(!checkpassword){
            return res.status(400).json({
                message:`invalid password`
            })
         }
         const token = jwt.sign({
            userId:userExist._id,
            email:userExist.email
        }, process.env.SECRET, {expiresIn:'1d'})
        
    
        await userExist.save()

        res.status(200).json({
            message:'login successful',
            token,
             user:userExist
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.verify = async(req,res)=>{
    try{
// const id = req.params.id
const id = req.params.id

if (!id){
    return res.status(404).json({
        error:'user not found'
    })
}

const verifyuser = await userModel.findByIdAndUpdate(id,{isVerified:true},{new:true})

res.status(200).json({
    message:`user with email:${verifyuser.email} has been verified successfully`,
    data:verifyuser
})
}catch(err){
   //handle JWT verification errors
    if(err instanceof jwt.TokenExpiredError){
        return res.status(401).json({
            error:'Token expired'
        });
    }else if(err instanceof jwt.JsonWebTokenError){
        return res.status(401).json({
            error:'Invalid token'
        })
    }
    res.status(500).json({
        error:err.message
    })
   
}
}
exports.Admin = async (req, res) => {
    try {
        const userToken = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(userToken, process.env.SECRET);
        const userId = decoded.userId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.isAdmin === true) {
            return res.status(400).json({
                message: 'User is already an admin'
            });
        }

        const updateAdmin = await userModel.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
        if (!updateAdmin) {
            return res.status(404).json({
                message: 'Failed to update user to admin'
            });
        }

        return res.status(200).json({
            message: `${updateAdmin.businessName} has been made admin`,
            user: updateAdmin
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
exports.forgetPassword = async (req,res)=>{
    try {

        // request for the users email
        const {email} = req.body

        // check if the users email exist in the userModel
        const user = await userModel.findOne({email})
        if (!user) {
            return res.status(404).json({
                error:"user not found"
            })
        }

        // if user found generate a new token for the user
        const token = jwt.sign({userId:user._id},process.env.SECRET,{expiresIn:"5mins"})

        const link = `${req.protocol}:${req.get("host")}resetPassword${token}`
        const html =  dynamicMail(link, user.firstName)

        sendEmail({
            email: user.email,
            subject:"KINDLY VERIFY YOUR EMAIL",
            html:html
        })

        // throw a success message
        res.status(200).json({
            messaeg:"Email send successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}
exports.resetPassword = async(req,res)=>{
    try {

        // get the token to the params
        const {token} = req.params
        // get the newpassword
       const {newPassword,confirmPassword} = req.body
       if(newPassword !== confirmPassword){
        return res.status(400).json({
            error:"password does not match"
        })
       }

    //    check the validity of the token
    const decoded = jwt.verify(token,process.env.SECRET)

    // find the user from the token
    const user = await userModel.findById(decoded.userId)
    if (!user) {
        return res.status(400).json({
            error:"user not found"
        })
    }

    // encrypt the new password
    const saltPass = bcrypt.genSaltSync(11)
    const hash = bcrypt.hashSync(newPassword, saltPass)

    user.password = hash
    await user.save()

    res.status(200).json({
        messaeg:"password reset successfully"
    })
        
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
}