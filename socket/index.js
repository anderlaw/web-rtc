const app = require('express')()
const UserSocketMapper = require('./cache')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const userSocketMapper = new UserSocketMapper()

app.get('/', (req, res) => {
    // res.send('hello,world!')
    res.sendFile(__dirname + '/index.html')
})
app.get('/userlist',(req, res) => {
    res.send(userSocketMapper.getUserList())
})
io.on('connection', socket => {
    socket.on('userOnline',username => {
        if(userSocketMapper.getUserList().find(name => name === username)){
            socket.emit('error-userjoin')
        }else{
            //write into userSocketMapper
            userSocketMapper.add(username,socket.id)
            io.sockets.emit('userOnline',username)
        }
    })
    socket.on('disconnect', function () {
        const username = userSocketMapper.getUsernameBySocketId(socket.id)
        socket.broadcast.emit('userOffline',username)
    });

    socket.on('videoOffer',data => {
        const {offer,from,target} = data
        const targetSocketId = userSocketMapper.getSocketIdByUsername(target)
        io.to(targetSocketId).emit('videoOffer',data)
    })
    socket.on('videoAnswer',data => {
        const {answer,from,target} = data
        const targetSocketId = userSocketMapper.getSocketIdByUsername(target)
        io.to(targetSocketId).emit('videoAnswer',data)
    })
    socket.on('videoCandidate',data => {

        const {candidate,from,target} = data
        console.log('videoCandidate',{
            from,target
        })
        const targetSocketId = userSocketMapper.getSocketIdByUsername(target)
        io.to(targetSocketId).emit('videoCandidate',data)
    })
    socket.on('webRTC', data => {
        //emit: deliverCall
        console.log(data)
        socket.broadcast.emit('webRTC', data)
        //广播信息（发给除了当前连接的其他连接）
    })
    // socket.on('create_username',username=>{
    //     //store the username
    //     users[socket.id] = username
    //     console.log(username)
    //     socket.broadcast.emit('create_username',username)
    // })
    // socket.on('disconnect',() => {
    //     const currentUsrname = users[socket.id]
    //     if(currentUsrname){
    //         socket.broadcast.emit('user_leave',currentUsrname)
    //     }
    // })
    // socket.on('send_message',message => {
    //     const username = users[socket.id]
    //     socket.broadcast.emit('send_message',{
    //         username:username,
    //         message:message
    //     })
    // })
})
http.listen(4000, () => {
    console.log(`server is running in port ${4000}`)
})