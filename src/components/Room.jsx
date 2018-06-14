import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

class Room extends React.Component {
 
  state = {
    questionList: [],
  };

  componentDidMount() {
    this.props.socket.on('send-all-questions', questions => {
      this.setState({questionList: questions});
      console.log('questionList: ', questions);
    });
  };

  componentWillUnmount() {
    this.props.socket.off('send-all-questions');
  };

  sendQuestion = (ev) => {
    console.log('sending this question: ', ev.target.question.value);
    ev.preventDefault();
    let newEntry = {
      text: ev.target.question.value, 
      votes: 0,
      room: this.props.roomID
    };
    if (ev.target.question.value !== ''){
      this.props.socket.emit('send-question', newEntry);
    }
    ev.target.reset();
  };

  vote = (ev) => {
    ev.preventDefault();
    this.props.socket.emit('vote', {id: ev.target.id, room: this.props.roomID});
    console.log('vote: ', ev.target.id);
  };

render() {
  return (
    <React.Fragment>

      <button onClick={this.props.leaveRoom}>LEAVE ROOM</button>

      <form onSubmit={this.sendQuestion} name="form">
        <input size="50" name="question" placeholder="Question..."/>
        <input type="submit" value="Send Question" />
      </form>

      <ul>
        {this.state.questionList.map((item, index) => {
          console.log('R2. Current Items', item, index);
          return <li key={index}>
          <span>QUESTION: "{item.text}"</span>
          <span> VOTES: {item.votes} </span>
          <button name='likes' id={item._id} onClick={this.vote}> Upvote </button>
          </li>
        })}
      </ul>
    </React.Fragment>
  )
}  

};

export default Room;