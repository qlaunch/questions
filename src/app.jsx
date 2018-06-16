import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import ReactSwipe from 'react-swipe';
import './style.scss';

const socket = io('http://localhost:3000');
// const socket = io('https://qlaunch.herokuapp.com/');
// const socket = io();

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
    console.log('joining room', ev.target.id)
    ev.preventDefault();
    if(this.state.room === null){
      socket.emit('join', {enter: ev.target.id, exit: 'default'})
    }
    else if(this.state.room !== ev.target.id){
      socket.emit('join', {enter: ev.target.id, exit: this.state.room})
    }
    this.setState({room: ev.target.id})
    this.next(ev)
  }
  


  render() {
    
    return <Fragment>
      <div><img id="logo" src={require('../designs/qlaunch-logo.png')} /><img id="troll" src="http://i0.kym-cdn.com/photos/images/facebook/000/096/044/trollface.jpg" /></div>
        <ReactSwipe key={2} ref={reactSwipe => this.reactSwipe = reactSwipe} swipeOptions={{continuous: false}} className="mySwipe">
          <div data-index="0">
              <form id="roomForm" onSubmit={this.createRoom} name="form">
              <div id="host">Host an Event</div>
                <input id="roomInput" size="50" name="room" placeholder="Room Name..."/>
                <button class="button" id="roomButton" type="submit"><span> Create </span></button>
              </form>
              <ul id="current"> There are currently {this.state.rooms.length} Events Open
    
                {this.state.rooms.map((room, index) => {
                  if(room !== 'default'){
                  return <li key={index}>
                    <span id="room"> {room} </span>
                    <button class="button" name='room' id={room} onClick={this.join}><span> Join </span></button>
                  </li>
                  }
                })}
              </ul>
            <button id="roomButton" type="button" onClick={::this.next}> Room </button>
          </div>
          <div id ="roomName" data-index="1"> {this.state.room}
          
              <form onSubmit={this.sendQuestion} name="form">
                <input id="questionInput" size="50" name="question" placeholder="Question..."/>
                <button id="questionButton" type="submit"> Add Question </button>
              </form>
              <button id="lobbyButton" type="button" onClick={::this.prev}> Return to Lobby </button>
            <ul>
              {this.state.data.map((item, index) => {
                return <div key={index}>
                <span> {item.votes.length} votes </span>
                <span> {item.text} </span>
                <button className="likeButton" name='likes' id={item._id} onClick={this.vote}> Like </button>
              {item.votes.indexOf(this.state.clientId) > -1 ? (<span id="voted"> voted </span>) : (<span></span>)}
                </div>
              })}
            </ul>

          </div>
      </ReactSwipe> 
    </Fragment>
  };
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);