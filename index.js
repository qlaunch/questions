'use strict';

const App = require('express')();
const http = require('http').Server(App);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Questions = require('./models/questions.js');
const Room = require('./models/room');

mongoose.connect('mongodb://localhost:27017/qlaunch');

io.on('connection', function (socket) {

  socket.on('join-room', (roomID) => {//roomID = string which is the mongo ID
    socket.join(roomID);//socket is joined
    console.log('joining room: ', roomID);
    Questions.find({ room: roomID })
      .then(questions => {
        console.log('B2-join-room. created questions from db');
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        console.log('B3-join-room. sorted questions from db: ', questions);
        return questions;
      })
      .then(questions => {
        console.log('B4-join-room. questions before sending sorted questions');
        // socket.to(question.room).emit('send-all-questions', questions);
        io.in(roomID).emit('send-all-questions', questions);//Bug: Anytime someone joins a room, the questionList gets resent every time
      });
  });

  socket.on('leave-room', (roomID) => {
    socket.leave(roomID);
    console.log('left room: ', roomID);
  });


  socket.on('send-question', (question) => {
    console.log('B1. question received: ', question);

    Questions.create(question)
      .then(() => {
        return Questions.find({ room: question.room });
      })
      .then(questions => {
        console.log('B2. created questions from db');
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        console.log('B3. sorted questions from db: ', questions);
        return questions;
      })
      .then(questions => {
        console.log('B4. questions before sending sorted questions');
        // socket.to(question.room).emit('send-all-questions', questions);
        io.in(question.room).emit('send-all-questions', questions);
      });
  });

  socket.on('vote', (id) => {
    console.log('user added a vote ', id);

    Questions.find({ _id: id.id })
      .then(question => {
        console.log('question:', question[0]);
        // ++question[0].votes;
        question[0].votes += 1;
        return question[0].save()
          .then(() => {
            console.log('SAVED DAWG!: ', question[0]);
          })
          .catch((error) => {
            console.error('error: ', error);
          });
      })
      .then(() => {
        Questions.find({ room: id.room })
          .then(questions => {
            console.log('questions: ', questions);
            questions.sort((a, b) => {
              return b.votes - a.votes;
            });
            return questions;
          })
          .then(questions => {
            io.in(id.room).emit('send-all-questions', questions);
          });
      });
  });

  socket.on('first-load-get-rooms', rooms => {
    console.log('Initial Get Hit: ', rooms);
    Room.find()
      .then((rooms) => {
        console.log('Rooms Retrieved: ', rooms);
        return rooms;
      })
      .then((rooms) => {
        socket.emit('send-all-rooms', rooms);
      });
  });

  socket.on('create-room', room => {
    console.log('Create Hit: ', room);
    Room.create(room)
      .then((databaseRoom) => {
        console.log('databaseRoom: ', databaseRoom);
        io.emit('new-room-added', databaseRoom);
      })
      .catch((error) => {
        console.error('error: ', error);
      });
  });

});

const Bundler = require('parcel-bundler');
const bundler = new Bundler('./public/index.html');
app.use(bundler.middleware());


http.listen(8000, function () {
  console.log('listening on http://localhost:8000');
});