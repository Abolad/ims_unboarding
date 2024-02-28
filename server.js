const express = require('express')
const cors = require('cors')

const userRouter= require('./routers/userRouter')


require('./config/config')
const port = process.env.port

const app = express()
app.use(cors({origin:"*"}))

app.use(express.json())

app.use('/uploads', express.static('uploads'));

app.use("/api/v1",userRouter)


app.listen(port,()=>{
    console.log(`server is listening on port:${port}`)
})
