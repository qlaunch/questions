'use strict';

import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import ReactSwipe from 'react-swipe';

import './styles/main.scss';

import './img/qlaunch-logo.png';

// const socket = io('http://localhost:3000');
const socket = io.connect();

let socketId;
socket.on('connect', () => {
  console.log('session id', socket.id);
  socketId = socket.id;
})


class App extends Component {
  state = {
    rooms: [],
    room: null,
    data: [],
    view: true,
    clientId: null,
  }

  componentDidMount() {
    
    socket.on('rooms', data => {
      console.log('data', data)
      let rooms = data.filter(room => room !== 'default');
      this.setState({rooms: rooms})
      console.log(this.state)
    });
    socket.on('send-all-questions', data => {
      console.log('getting data', data)
      this.setState({
        data: data,
        clientId: socketId
      });
      console.log('initial state on component mount', this.state);
    })
    
  }
  getData = () => {
  socket.on('rooms', data => {
      console.log('data', data)
      let rooms = data.filter(room => room !== 'default');
      rooms.filter(room => room !== this.state.room)
      this.setState({rooms: rooms})
      console.log('the state', this.state)
    });
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
    this.next(ev)
    
  };
  
  vote = (ev) => {
    console.log('voting')
    ev.preventDefault();
    socket.emit('vote', {
      id: ev.target.id,
      room: this.state.room,
      clientId: this.state.clientId
    });
  };

  next(ev) {
    ev.preventDefault()
    this.reactSwipe.next()
  }

  prev(ev) {
    ev.preventDefault()
    this.reactSwipe.prev();
  }

  join = ev => {
    console.log('joining room', ev.target.value)
    ev.preventDefault();
    if(this.state.room === null){
      socket.emit('join', {enter: ev.target.value, exit: 'default'})
      this.setState({room: ev.target.value})
    }
    else if (this.state.room !== ev.target.value) {
      socket.emit('join', {enter: ev.target.id, exit: this.state.room})
      this.setState({room: ev.target.value})
    }
    this.next(ev)
  }
  


  render() {
    
    return <Fragment>

        <ReactSwipe key={2} ref={reactSwipe => this.reactSwipe = reactSwipe} swipeOptions={{continuous: false}} className="mySwipe">
          <div data-index="0">
          <header>
              <img id="logo" src="./img/qlaunch-logo.png" alt="qlaunch logo"/>
              <button className="room-toggle" type="button" onClick={this.next}>Room</button>
          </header>

            <h1>Lobby</h1>
            <h3>Your current room: {this.state.room}</h3>
              <form onSubmit={this.createRoom} name="form">
                <input size="50" name="room" placeholder="New Room Name..."/>
                <input type="submit" value="join/create" />
              </form>
              <h4>There are currently {this.state.rooms.length} Events Open</h4>
              {/* <ul> 
    
                {this.state.rooms.map((room, index) => {
                  if(room !== 'default'){
                  return <li key={index}>
                    <span> {room} </span>
                    <span name='room' id={room} onClick={this.join}> Join </span>
                  </li>
                  }
                })}
              </ul> */}
              <select name="room" onChange={this.join}>
                <option  disabled selected>
                      Select a room -->
                </option>
                {this.state.rooms.map((room, index) => {
                  if (room !== 'default') {
                    return <option value={room} id={room} >
                      {room}
                    </option>
                  }
                })}
              </select>
          </div>
          <div data-index="1">
          <header>
              <img id="logo" src="./img/qlaunch-logo.png" alt="qlaunch logo"/>
              <button className="room-toggle" type="button" onClick={this.prev}>Lobby</button>
          </header>
            <h1>{this.state.room}</h1>
            <form onSubmit={this.sendQuestion} name="form">
              <input size="50" name="question" placeholder="Question..."/>
              <input type="submit" value="Send Question" />
            </form>
            <ul>
              {this.state.data.map((item, index) => {
                
                return <li key={index}>
                
                  {item.votes.indexOf(this.state.clientId) > -1 ?
                    (<div className="question-group">
                    <span className="votes voted">{(item.votes.length - 1)}</span>
                    <span className="text">{item.text}</span>
                    <span className="voted star" name='likes' id={item._id} onClick={this.vote}>⋆</span>
                    </div>) :
                    (<div className="question-group">
                      <span className="votes">{(item.votes.length - 1)}</span>
                    <span className="text">{item.text}</span>
                    <span className="unvoted star" name='likes' id={item._id} onClick={this.vote}>⋆</span></div>)}
                </li>
              })}
            </ul>
          </div>
      </ReactSwipe> 
    </Fragment>
  };
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);