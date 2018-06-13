'use strict';

const App = require('express')();
const http = require('http').Server(App);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const Questions = require('./models/questions.js');
const Room = require('./models/room');

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
        // ++question[0].votes;
        question[0].votes += 1;
        question[0].save((error) => {
          if (error) {
            console.error('error: ', error);
          }
        });
      });
    Questions.find({room: id.room})
      .then(questions => {
        console.log('hit me!');
        questions.sort((a, b) => {
          return b.votes - a.votes;
        });
        return questions;
      })
      .then(questions => {
        io.to(id.room).emit(questions);
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
    // socket.join(room);//

    // Questions.find({room: room})
    //   .then(questions => {
    //     questions.sort((a, b) => {
    //       return b.votes - a.votes;
    //     });
    //     return questions;
    //   })
    //   .then(questions => {
    //     socket.emit('send-all-questions', questions);
    //   });
  });

});

http.listen(8000, function(){
  console.log('listening on http://localhost:8000');
});