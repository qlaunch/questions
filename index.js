'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Questions = require('./models/questions.js');

mongoose.connect('mongodb://localhost:27017/qlaunch');

io.on('connection', function(socket){
  // Questions.find({})
  //   .then(data => {
  //     console.log('initial load', data);
  //     data.sort((a, b) => {
  //       return b.votes - a.votes;
  //     });
  //     console.log('sorted', data);
  //     return data;
  //   })
  //   .then(data => {
  //     socket.emit('send-all-questions', data);
  //   });
  
  socket.on('send-question', question => {
    console.log('B1. question received');

    Questions.create(question)
      .then(() => {
        return Questions.find({room: question.room});
      })
      .then(questions => {
        console.log('B2. created questions from db', questions);
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        console.log('B3. sorted questions from db', questions);
        return questions;
      })
      .then(questions => {
        console.log('B4. questions before sending sorted questions', questions);
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
    console.log('user created/joined room');
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
  });

});

http.listen(3000, function(){
  console.log('listening on http://localhost:3000');
});