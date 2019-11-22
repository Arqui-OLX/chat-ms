var mongoose = require('mongoose');

mongoose.connect('mongodb://chat-db/chat')
.then(db => console.log('db connected'))
  .catch(err => console.log(err));

var Schema = mongoose.Schema;



var chatRoomSchema = new Schema({
  
  messages: 
  [
    { 
      userID: Number, 
      message: String, 
      created_at : { 
        type : Date, 
        default: Date.now 
      }
    }
  ],

  users: {
    buyerID: Number, 
    sellerID: Number, 
    _id: false
  }
  
});

var Chat = mongoose.model('Chat', chatRoomSchema);


module.exports = Chat;

