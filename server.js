var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var Chat = require("./model/chatRoom");
var cors = require('cors');
var port = 3000;


app.use(express.json());
app.use(cors());


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/:id/room', function(req, res){
  Chat.find( {$or: [ {"users.buyerID": parseInt(req.params.id) }, {"users.sellerID": parseInt(req.params.id)} ]}, function(err, data) {
    if(err) {
        res.send('Error al obtener la lista de chat rooms');
    } else {
        console.log(data);
        var result = []
        for (var i in data) {
          
          var user;

          if (data[i].users.sellerID == req.params.id) {
            user = data[i].users.buyerID;
          } else {
            user = data[i].users.sellerID;
          }
          var chat = {id: data[i]._id, user: user,lastMessage: data[i].messages.pop()};
          result.push(chat);
        }
        res.json(result);
    }

  });
});

app.get('/:id_room', function(req, res) {
  Chat.find({"_id": req.params.id_room}, 'messages',function(err, data) {
    if(err) {
      res.send('Error al obtener la lista de mensajes');
    } else {
      console.log(data);
      res.json(data);
    }
  });
});


app.post('/room', function (req, res) {

    var chat = new Chat(req.body)
    chat.save(function(err, data) {
        if (err){
            res.send('Error al crear una nueva sala de chat');
            return console.error(err);
        }else{
            console.log(data);
            res.json(data);
        }
    });
     
});


io.on('connection', function(socket){
  console.log('User connected');

  socket.on('subscribe', function(room) {
    console.log('joining room', room);
    socket.join(room);
  });
  
  socket.on('send message', function(data) {
    console.log('sending room post', data.room);
  
    Chat.findById(data.room, function (err, doc) {
      if (err) {
    
      } else {
        doc.messages.push({"userID": data.userID, "message": data.message});
        doc.save(function (err, doc) {});
      }
    });
  
    
    io.in(data.room).emit('conversation private post', {
        
        userID: data.userID,
        message: data.message,


    });
  });

});



http.listen(port, function(){
  console.log('listening on *:' + port);
});
