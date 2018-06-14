import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

import Room from './Room.jsx';

// const socket = io('http://localhost:8000');
const socket = io('http://192.168.1.102:8000');
socket.on('connect', () => {
  console.log('client connected!');
})

class App extends React.Component {
  state = {
    roomID: null,
    // data: [],
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

  createRoom = ev => {
    ev.preventDefault();
    let targetName = ev.target.room.value;
    console.log('targetName: ', targetName);
    this.setState({room: targetName});
    socket.emit('create-room', {name: targetName});
    ev.target.reset();
  };
  
  // vote = (ev) => {
  //   ev.preventDefault();
  //   socket.emit('vote', {id: ev.target.id, room: this.state.room});
  //   console.log('vote: ', ev.target.id);
  // };

  joinRoom = (id) => {
    this.setState({roomID: id});
    socket.emit('join-room', id);//is a string ID for the room
  };


  render() {
    return <React.Fragment>
      <h1>QLaunch</h1>
      {this.state.roomID === null &&
      <div>
        <form onSubmit={this.createRoom} name="form">
          <input size="50" name="room" placeholder="Room Name..."/>
          <input type="submit" value="join/create" />
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
        </div>
      </div>
      }
      {this.state.roomID !==null && <Room socket={socket} roomID={this.state.roomID} />}
    </React.Fragment>
  }
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);