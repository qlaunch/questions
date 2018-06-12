var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



let MSGS = [
  {
    msg: 'test',
    votes: 2
  }, 
  {
    msg: 'help',
    votes: 4
  }
  ];

io.on('connection', function(socket){
  socket.emit('msgs', {msgs: MSGS});

  socket.on('send-msg', (msg) => {
    console.log('msg received')
    MSGS.push(msg);
    MSGS.sort((a, b) => {
      return b.votes - a.votes;
    })
    io.emit('msgs', {msgs: MSGS});
  });
});


const Bundler = require('parcel-bundler');
let bundler = new Bundler('./public/index.html');
app.use(bundler.middleware());

http.listen(3000, function(){
  console.log('listening on *:3000');
});