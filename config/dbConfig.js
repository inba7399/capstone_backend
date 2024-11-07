const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL)

const connection = mongoose.connection;

connection.on('connected',()=>{
    console.log("mongooooniya")
})

connection.on('error',()=>{
    console.log("mongo not conected")
})


module.exports= mongoose