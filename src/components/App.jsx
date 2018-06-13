import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

import Room from './Room.jsx';

const socket = io('http://localhost:8000');
socket.on('connect', () => {
  console.log('client connected!');
})

class App extends React.Component {
  state = {
    roomID: null,
    data: [],
    roomsList: [],
  };

  componentDidMount() {
    socket.on('send-all-rooms', rooms => {
      console.log('rooms: ', rooms);
      this.setState({roomsList: rooms});
      console.log('rooms state: ', this.state);
    });
    socket.emit('first-load-get-rooms', {
       
    });
    socket.on('new-room-added', addedRoom => {
      console.log('addedRoom: ', addedRoom);
      this.state.roomsList.push(addedRoom);
      this.setState({roomsList: this.state.roomsList});
    });
  };

  // componentDidMount() {
  //   socket.on('send-all-questions', data => {
  //     console.log('A1. client got questions', data);
  //     this.setState({data: data});
  //     console.log('A2. inital state after load', this.state);
  //   })
  // }
  

  sendQuestion = (ev) => {
    console.log('sending this question', ev.target.question.value);
    ev.preventDefault();
    let newEntry = {
      text: ev.target.question.value, 
      votes: 0,
      room: this.state.room
    };
    console.log('sending this question', ev.target.question.value);
    ev.preventDefault();
    if(ev.target.question.value !== ''){
    socket.emit('send-question', newEntry);
    }
    ev.target.reset();
  };

  createRoom = ev => {
    ev.preventDefault();
    let targetName = ev.target.room.value;
    console.log('targetName: ', targetName);
    this.setState({room: targetName});
    socket.emit('create-room', {name: targetName});
    ev.target.reset();
  };
  
  vote = (ev) => {
    ev.preventDefault();
    socket.emit('vote', {id: ev.target.id, room: this.state.room});
    console.log('vote: ', ev.target.id);
  };

  joinRoom = (id) => {
    this.setState({roomID: id})
    
  };


  render() {
    console.log('R1. render questions', this.state.data);
    return <React.Fragment>
      <h1>qLaunch</h1>
      
      <form onSubmit={this.createRoom} name="form">
        <input size="50" name="room" placeholder="Room Name..."/>
        <input type="submit" value="join/create" />
      </form>

      <ul>
        {this.state.data.map((item, index) => {
          console.log('R2. Current Items', item, index);
          return <li key={index}>
          <span> {item.votes} votes </span>
          <span>{item.text}</span>
          <span name='likes' id={item._id} onClick={this.vote}> Like </span>
          </li>
        })}
      </ul>

      <form onSubmit={this.sendQuestion} name="form">
        <input size="50" name="question" placeholder="Question..."/>
        <input type="submit" value="Send Question" />
      </form>

      <div>
        {this.state.roomsList.map((roomItem) => {
          return (
          <div key={roomItem._id}>
          {roomItem._id}{' (DELETE roomItem._id LATER) '}
            Room: {roomItem.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={() => this.joinRoom(roomItem._id)}>Join Room</button>
          </div>
          )
        })}
        {this.state.roomID !==null && <Room  />}
      </div>
    </React.Fragment>
  }
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);