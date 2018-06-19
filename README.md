# Questions by QLaunch
A live question polling application. Great for meetings, town halls... Anytime people want to ask questions.

## Instructions

### Installation

1. Run this command to install all dependencies
```
npm install
```

### Running the Server
1. Make sure you have your mongo database properly installed and your mongo daemon is running.  Ensure that the database is connecting to your locally run mongoDB.

2. Run these to run the server
```
node index.js
// or
nodemon index.js
```

The server will run in localhost:3000

### Running the Front End
1. Run this command to run the front end.
```
npm run hot
```

### Using The App

When you first arrive at the qLaunch app, you will see a form to create a room.  You will also see a list of available rooms to join.  Only rooms that currently have users in it are listed.

![lobby view]  (question.png)

Upon creating a room or joining a room, you will be directed to that room.  Any questions in that room will be displayed with their current votes.  The questions will be displayed in order of highest votes to lowest.

![room view]  (question.png)

You are allowed to vote once per question.  You can decide to "unvote" a question by simply clicking the vote button again.

## Special Thanks
* Tomasz Zwierzchon for the socket.io testing boilerplate: https://medium.com/@tozwierz/testing-socket-io-with-jest-on-backend-node-js-f71f7ec7010f