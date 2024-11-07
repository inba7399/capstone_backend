const express = require("express")
const app = express()
require('dotenv').config()
const dbconfig = require("./config/dbConfig")
app.use(express.json())
const port = process.env.PORT || 5000
const userRoute = require("./routes/userRoute")
const cros = require("cors")
const adminRoute = require("./routes/adminRoute")
const doctorRoute = require("./routes/doctorRoute")
const http = require("http")
const server = http.createServer(app)
const {Server} = require("socket.io")
app.use(cros())

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET",'POST'],
    }
})

io.on("connection", (socket)=>{
      socket.on("join_room",(data)=>{
         socket.join(data)
      })

      socket.on("send_message",(data)=>{
        socket.to(data.room).emit("recive_message", data)
      })
})

const nameToSocketIdMap = new Map();
const socketidToNameMap = new Map();

io.on("connection", (socket) => {
 
  socket.on("room:join", (data) => {
    const { name, room } = data;
    nameToSocketIdMap.set(name, socket.id);
    socketidToNameMap.set(socket.id, name);
    io.to(room).emit("user:joined", { name, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});



app.use('/api/user', userRoute)
app.use('/api/admin', adminRoute)
app.use("/api/doctor", doctorRoute)



server.listen(port, () => console.log(`server is up in ${port}`))