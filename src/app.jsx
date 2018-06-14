import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

const socket = io('http://localhost:3000');

let socketId;
socket.on('connect', () => {
  console.log('session id', socket.id);
  socketId = socket.id;
})


class App extends Component {
  state = {
    room: null,
    data: [],
    clientId: null,
  }

  componentDidMount() {
    socket.on('send-all-questions', data => {
      console.log('getting data', data)
      this.setState({
        data: data,
        clientId: socketId
      });
      console.log('initial state on component mount', this.state);
    })
  }
  

  sendQuestion = (ev) => {
    ev.preventDefault();
    let newEntry = {
      text: ev.target.question.value, 
      votes: 0,
      room: this.state.room
    }
   
    ev.preventDefault();
    if(ev.target.question.value !== ''){
    socket.emit('send-question', newEntry);
    }
    ev.target.reset();
  };
  

  createRoom = ev => {
    ev.preventDefault();
    let room = ev.target.room.value;
    this.setState({room: room});
    socket.emit('create-room', room);
    ev.target.reset();
  };
  
  vote = (ev) => {
    console.log('voting')
    ev.preventDefault();
    socket.emit('vote', {
      id: ev.target.id,
      room: this.state.room,
    });
  };

  


  render() {
    
    return <Fragment>
      <h1>qLaunch</h1>
      <h2>Room: {this.state.room}</h2>
      
      <form onSubmit={this.createRoom} name="form">
        <input size="50" name="room" placeholder="Room Name..."/>
        <input type="submit" value="join/create" />
      </form>

      <form onSubmit={this.sendQuestion} name="form">
        <input size="50" name="question" placeholder="Question..."/>
        <input type="submit" value="Send Question" />
      </form>

      <ul>
        {this.state.data.map((item, index) => {
          return <li key={index}>
          <span> {item.votes} votes </span>
          <span>{item.text}</span>
          <span name='likes' id={item._id} onClick={this.vote}> Like </span>
          </li>
        })}
      </ul>
    </Fragment>
  }
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);