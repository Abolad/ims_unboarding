const multer= require("multer")

const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./uploads")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const filefilter = (req,file,cb)=>{
    if(file.mimetype.startWith('image/')){
        cb(null,true);
    }else{
        cb(new Error('this file is not supported, image only'),false)
    }
}

const maxFile = 5

const filesize= {
    limits:1024*1024*10
}

const uploading = multer({
    storage,
    filefilter,
    limits:{
        ...filesize,
    files:maxFile
}
})

module.exports= uploading