import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

const socket = io('http://localhost:3000');
socket.on('connect', () => {
  console.log('client connected!');
})

class App extends Component {
  state = {
    MSGS: []
  }

  componentDidMount() {
    socket.on('msgs', (data) => {
      console.log('client got msgs', data);
      this.setState({MSGS: data.msgs});
      console.log(this.state)
    })
  }
  

  sendMSG = (ev) => {
    ev.preventDefault();
    let newQuestion = {msg: ev.target.msg.value, votes: 0}
    if(ev.target.msg.value){
    socket.emit('send-msg', newQuestion);
    }
    ev.target.reset();
  };
  
  

  render() {
    return <Fragment>
      <h1>qLaunch</h1>
      
      <ul>
        {this.state.MSGS.map((msg, index) => {
          return <li key={index}>{msg.msg} has {msg.votes} votes</li>
        })}

      </ul>

      <form onSubmit={this.sendMSG} name="form">
        <input size="50" name="msg" placeholder="Message..."/>
        <input type="submit" value="Send Message" />
      </form>
    </Fragment>
  }
}


const root = document.getElementById('root');
ReactDOM.render(<App/>, root);