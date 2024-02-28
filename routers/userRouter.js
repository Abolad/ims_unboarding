const express = require("express");
const router = express.Router()
const { signUp, Login, verify, Admin}=require('../controllers/userController')
const authenticate = require('../middleware/authenticate')
// const uploading = require("../utils/multer")

router.post('/createuser',signUp)
router.post('/login',Login)
router.get('/verify/:id', verify )
router.get('/isAdmin',Admin)
// router.put('/forgetpassword/:id',forgetPassword)




module.exports= router
