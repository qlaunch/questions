'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Questions = require('./models/questions.js');

mongoose.connect('mongodb://localhost:27017/qlaunch');

io.on('connection', function(socket){
  Questions.find({})
    .then(data => {
      console.log('initial load', data);
      data.sort((a, b) => {
        return b.votes - a.votes;
      });
      console.log('sorted', data);
      return data;
    })
    .then(data => {
      socket.emit('send-all-questions', data);
    });
  
  socket.on('send-question', question => {
    console.log('B1. question received');

    Questions.create(question)
      .then(() => {
        return Questions.find({});
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
        io.emit('send-all-questions', questions);
      });
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});