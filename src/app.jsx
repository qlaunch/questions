import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import ReactSwipe from 'react-swipe';

const socket = io('http://localhost:3000');
socket.on('connect', () => {
  console.log('room', socket)
})

class App extends Component {
  state = {
    rooms: [],
    room: null,
    data: [],
    view: true
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
      this.setState({data: data});
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
    this.next()
  };
  
  vote = (ev) => {
    console.log('voting')
    ev.preventDefault();
    socket.emit('vote', {id: ev.target.id, room: this.state.room});
    
  };

  next() {
    if(this.state === false){
    this.setState({view: true})
    }else{
      this.setState({view: false})
    }
    this.reactSwipe.next();
  }

  prev() {
    this.reactSwipe.prev();
  }

  join = ev => {
    console.log('joining room', ev.target.id)
    ev.preventDefault();
    if(this.state.room === null){
      socket.emit('join', {enter: ev.target.id, exit: 'default'})
    }else {
      socket.emit('join', {enter: ev.target.id, exit: this.state.room})
    }
    this.setState({room: ev.target.id})
    this.next()
  }
  


  render() {
    
    return <Fragment>
      <h1>qLaunch</h1>
        <ReactSwipe ref={reactSwipe => this.reactSwipe = reactSwipe} className="mySwipe">
          <div> Host an Event
              <form onSubmit={this.createRoom} name="form">
                <input size="50" name="room" placeholder="Room Name..."/>
                <input type="submit" value="join/create" />
              </form>
              <ul> List of Chat Rooms Available
                {this.state.rooms.map((room, index) => {
                  if(room !== this.state.room){
                  return <li key={index}>
                    <span> {room} </span>
                    <span name='room' id={room} onClick={this.join}> Join </span>
                  </li>
                  }
                })}
              </ul>
            
          </div>
          <div> Questions
          
            <ul>
              {this.state.data.map((item, index) => {
                
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
          </div>

        
      </ReactSwipe>
      <button type="button" onClick={this.next}>Lobby</button>
      <button type="button" onClick={this.next}>Room</button>
    </Fragment>
  }
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);