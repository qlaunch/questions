'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Questions = require('./models/questions.js');

mongoose.connect('mongodb://localhost:27017/qlaunch');

function reorderMessages(messages) {
  messages.sort((a, b) => {
    return b.votes - a.votes;
  });
  return messages;
}

io.on('connection', function(socket){
  
  socket.on('send-question', question => {

    Questions.create(question)
      .then(() => {
        return Questions.find({room: question.room});
      })
      .then(questions => {
        return reorderMessages(questions);
      })
      .then(questions => {
        io.to(question.room).emit('send-all-questions', questions);
      });
  });

  socket.on('vote', id => {
    console.log('user added a vote ', id);

    Questions.find({_id: id.id})
      .then(question => {
        console.log('question: ', question[0].votes);
        let votes = question[0].votes;
        votes = ++votes;
        console.log('votes: ', votes);
        question[0].votes = votes;
        question[0].save((error) => {
          if (error) {
            console.error('error: ', error);
          }
        });
      });
    Questions.find({room: id.room})
      .then(questions => {
        
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        return questions;
      })
      .then(questions => {
        console.log('hit me!', questions);
        io.to(id.room).emit('send-all-questions', questions);
      });
  });

  socket.on('create-room', room => {

    socket.join(room);

    Questions.find({room: room})
      .then(questions => {
        return reorderMessages(questions);
      })
      .then(questions => {
        socket.emit('send-all-questions', questions);
      });
  });

});

http.listen(3000, function(){
  console.log('listening on http://localhost:3000');
});