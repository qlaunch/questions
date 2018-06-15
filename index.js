'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Questions = require('./models/questions.js');

mongoose.connect('mongodb://localhost:27017/qlaunch');

io.on('connection', function(socket){
  socket.join('default')
  socket.leave(socket.id)
  socket.emit('rooms', Object.keys(io.sockets.adapter.rooms))
  console.log('socket info', io.sockets.adapter.rooms)
  console.log('trying to find rooms', Object.keys(io.sockets.adapter.rooms))

  
  
  socket.on('send-question', question => {
    Questions.create(question)
      .then(() => {
        return Questions.find({room: question.room});
      })
      .then(questions => {
        
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        
        return questions;
      })
      .then(questions => {
        
        io.to(question.room).emit('send-all-questions', questions);
      });
      
  });

  socket.on('vote', id => {
    console.log('1 server vote')

    Questions.find({_id: id.id})
    .then(question => {
      console.log('2 found vote')
      let votes = question[0].votes;
      votes = ++votes;
      
      question[0].votes = votes;
      return question[0].save((error) => {
        if (error) {
          console.error('error: ', error);
        }
        return Questions.find({room: id.room})
        .then(questions => {
          
          questions.sort((a, b) => {
            return b.votes - a.votes;
          });
          return questions;
        })
        .then(questions => {
          console.log('emitting vote', questions)
          io.to(id.room).emit('send-all-questions', questions);
        });
      });
    });
  });

  socket.on('create-room', room => {
    
    socket.join(room);//

    Questions.find({room: room})
      .then(questions => {
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        return questions;
      })
      .then(questions => {
        socket.emit('send-all-questions', questions);
      });
      io.emit('rooms', Object.keys(io.sockets.adapter.rooms))
  });

  socket.on('join', data => {
    socket.join(data.enter);
    socket.leave(data.exit);
    io.emit('rooms', Object.keys(io.sockets.adapter.rooms))
    Questions.find({room: data.enter})
      .then(questions => {
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        return questions;
      })
      .then(questions => {
        socket.emit('send-all-questions', questions);
      });
  })

});

http.listen(3000, function(){
  console.log('listening on http://localhost:3000');
});