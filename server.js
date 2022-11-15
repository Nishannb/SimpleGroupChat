var express = require('express')
var app = express()
const bodyParser = require('body-parser')
const { Socket } = require('socket.io')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')

const url = 'mongodb://localhost:27017/ChatApp'

mongoose.connect(url)

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Error"));
db.once('open', ()=>{
    console.log('Database connected')
})


app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message', {
    name: String,
    message: String
})


app.post('/messages', async (req,res)=>{
    try {
        const{ name, message }= req.body
        var msg = new Message({name: name, message: message })
        await msg.save()
        const censored = await Message.findOne({message: "Badword"})
        if(censored){
            await Message.deleteOne({_id: censored.id})  
        } else{
            io.emit('message', msg)
        }
        res.sendStatus(200)
    } 
    catch(error){
        res.sendStatus(500)
        return console.error(error)
    } 
})

app.get('/messages', (req,res)=>{
    Message.find({}, (err, messages)=>{
        res.send(messages)
    })  
})

app.get('/messages/:user', (req,res)=>{
    const{user} = req.params
    Message.find({name: user}, (err, messages)=>{
        res.send(messages)
    })  
})
io.on('connection', (socket)=>{
    // console.log('user connected')
})


var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})