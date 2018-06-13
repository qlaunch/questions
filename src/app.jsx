import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

const socket = io('http://localhost:3000');
socket.on('connect', () => {
  console.log('client connected!');
})

class App extends Component {
  state = {
    room: null,
    data: []
  }

  componentDidMount() {
    socket.on('send-all-questions', data => {
      console.log('A1. client got questions', data);
      this.setState({data: data});
      console.log('A2. inital state after load', this.state);
    })
  }
  

  sendQuestion = (ev) => {
    console.log('sending this question', ev.target.question.value);
    ev.preventDefault();
    let newEntry = {
      text: ev.target.question.value, 
      votes: 0,
      room: this.state.room
    }
    console.log('sending this question', ev.target.question.value);
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
    console.log('joining room', room);
  }
  
  

  render() {
    console.log('R1. render questions', this.state.data);
    return <Fragment>
      <h1>qLaunch</h1>
      
      <form onSubmit={this.createRoom} name="form">
        <input size="50" name="room" placeholder="Room Name..."/>
        <input type="submit" value="join/create" />
      </form>

      <ul>
        {this.state.data.map((item, index) => {
          console.log('R2. Current Items', item, index);
          return <li key={index}>{item.text} has {item.votes} votes</li>
        })}

      </ul>

      <form onSubmit={this.sendQuestion} name="form">
        <input size="50" name="question" placeholder="Question..."/>
        <input type="submit" value="Send Question" />
      </form>
    </Fragment>
  }
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);