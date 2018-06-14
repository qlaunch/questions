'use strict';

const server = require('../index.js');

const io = require('socket.io-client');
const http = require('http');
const ioBack = require('socket.io');

const mongoose = require('mongoose');
const Questions = require('../models/questions.js');
mongoose.connect('mongodb://localhost:27017/qlaunch');

let socket;
let httpServer;
let httpServerAddr;
let ioServer;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  httpServer = http.createServer();
  httpServerAddr = httpServer.listen().address();
  ioServer = ioBack(httpServer);
  done();
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll((done) => {
  ioServer.close();
  httpServer.close();
  done();
});

/**
 * Run before each test
 */
beforeEach((done) => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  });
  socket.on('connect', () => {
    done();
  });
});

/**
 * Run after each test
 */
afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});


describe('basic socket.io example', () => {
  test('should communicate', (done) => {
    // once connected, emit Hello World
    ioServer.emit('echo', 'Hello World');
    socket.once('echo', (message) => {
      // Check that the message matches
      expect(message).toBe('Hello World');
      done();
    });
    ioServer.on('connection', (mySocket) => {
      expect(mySocket).toBeDefined();
    });
  });
  test('should communicate with waiting for socket.io handshakes', (done) => {
    // Emit sth from Client do Server
    socket.emit('example', 'some messages');
    // Use timeout to wait for socket.io server handshakes
    setTimeout(() => {
      // Put your server side expect() here
      done();
    }, 50);
  });
});


describe('main socket.io tests', () => {
  test('send-question works', (done) => {
    let testQuestion = {
      text: 'Hello World!', 
      votes: 0,
      room: 'test-room'
    };
    ioServer.emit('send-question', testQuestion);
    socket.once('send-question', (newQuestion) => {
      expect(newQuestion).toEqual(testQuestion);
      done();
    });
    ioServer.on('connection', (mySocket) => {
      expect(mySocket).toBeDefined();
    });
  });
  test('create-room works and returns the same room.', (done) => {
    let room = 'test-room';
    ioServer.emit('create-room', room);
    socket.once('create-room', passedRoom => {
      expect(passedRoom).toEqual(room);
      done();
    });
    ioServer.on('connection', (mySocket) => {
      expect(mySocket).toBeDefined();
    });
  });
  test('send-all-questions', (done) => {
    Questions.find({})
      .then(questions => {
        ioServer.emit('send-all-questions', questions);
        socket.once('send-all-questions', passedQuestions => {
          expect(passedQuestions.length).toEqual(questions.length);
          done();
        });
        ioServer.on('connection', (mySocket) => {
          expect(mySocket).toBeDefined();
        });
      });
  });
});