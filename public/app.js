'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _reactSwipe = require('react-swipe');

var _reactSwipe2 = _interopRequireDefault(_reactSwipe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var socket = (0, _socket2.default)('http://localhost:3000');
// const socket = io('https://qlaunch.herokuapp.com/');

var socketId = void 0;
socket.on('connect', function () {
  console.log('session id', socket.id);
  socketId = socket.id;
});

var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    var _ref;

    var _temp, _temp2, _this, _ret;

    _classCallCheck(this, App);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_temp2 = (_this = _possibleConstructorReturn(this, (_ref = App.__proto__ || Object.getPrototypeOf(App)).call.apply(_ref, [this].concat(args))), _this), _this.next = _this.next.bind(_this), _this.prev = _this.prev.bind(_this), _temp2), _this.state = {
      rooms: [],
      room: null,
      data: [],
      view: true,
      clientId: null
    }, _this.getData = function () {
      socket.on('rooms', function (data) {
        console.log('data', data);
        var rooms = data.filter(function (room) {
          return room !== 'default';
        });
        rooms.filter(function (room) {
          return room !== _this.state.room;
        });
        _this.setState({ rooms: rooms });
        console.log('the state', _this.state);
      });
    }, _this.sendQuestion = function (ev) {

      ev.preventDefault();
      var newEntry = {
        text: ev.target.question.value,
        votes: 0,
        room: _this.state.room
      };

      ev.preventDefault();
      if (ev.target.question.value !== '') {
        socket.emit('send-question', newEntry);
      }
      ev.target.reset();
    }, _this.createRoom = function (ev) {
      ev.preventDefault();
      var room = ev.target.room.value;
      _this.setState({ room: room });
      socket.emit('create-room', room);
      ev.target.reset();
      _this.next(ev);
    }, _this.vote = function (ev) {
      console.log('voting');
      ev.preventDefault();
      socket.emit('vote', {
        id: ev.target.id,
        room: _this.state.room,
        clientId: _this.state.clientId
      });
    }, _this.join = function (ev) {
      console.log('joining room', ev.target.id);
      ev.preventDefault();
      if (_this.state.room === null) {
        socket.emit('join', { enter: ev.target.id, exit: 'default' });
      } else {
        socket.emit('join', { enter: ev.target.id, exit: _this.state.room });
      }
      _this.setState({ room: ev.target.id });
      _this.next(ev);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      socket.on('rooms', function (data) {
        console.log('data', data);
        var rooms = data.filter(function (room) {
          return room !== 'default';
        });
        _this2.setState({ rooms: rooms });
        console.log(_this2.state);
      });
      socket.on('send-all-questions', function (data) {
        console.log('getting data', data);
        _this2.setState({
          data: data,
          clientId: socketId
        });
        console.log('initial state on component mount', _this2.state);
      });
    }
  }, {
    key: 'next',
    value: function next(ev) {
      ev.preventDefault();
      this.reactSwipe.next();
    }
  }, {
    key: 'prev',
    value: function prev(ev) {
      ev.preventDefault();
      this.reactSwipe.prev();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        _react.Fragment,
        null,
        _react2.default.createElement(
          'h1',
          null,
          'qLaunch'
        ),
        _react2.default.createElement(
          _reactSwipe2.default,
          { key: 2, ref: function ref(reactSwipe) {
              return _this3.reactSwipe = reactSwipe;
            }, swipeOptions: { continuous: false }, className: 'mySwipe' },
          _react2.default.createElement(
            'div',
            { 'data-index': '0' },
            ' Host an Event',
            _react2.default.createElement(
              'form',
              { onSubmit: this.createRoom, name: 'form' },
              _react2.default.createElement('input', { size: '50', name: 'room', placeholder: 'Room Name...' }),
              _react2.default.createElement('input', { type: 'submit', value: 'join/create' })
            ),
            _react2.default.createElement(
              'ul',
              null,
              ' There are currently ',
              this.state.rooms.length,
              ' Events Open',
              this.state.rooms.map(function (room, index) {
                if (room !== 'default') {
                  return _react2.default.createElement(
                    'li',
                    { key: index },
                    _react2.default.createElement(
                      'span',
                      null,
                      ' ',
                      room,
                      ' '
                    ),
                    _react2.default.createElement(
                      'span',
                      { name: 'room', id: room, onClick: _this3.join },
                      ' Join '
                    )
                  );
                }
              })
            ),
            _react2.default.createElement(
              'button',
              { type: 'button', onClick: this.next.bind(this) },
              'Room'
            )
          ),
          _react2.default.createElement(
            'div',
            { 'data-index': '1' },
            ' ',
            this.state.room,
            _react2.default.createElement(
              'ul',
              null,
              this.state.data.map(function (item, index) {

                return _react2.default.createElement(
                  'li',
                  { key: index },
                  _react2.default.createElement(
                    'span',
                    null,
                    ' ',
                    item.votes.length,
                    ' votes '
                  ),
                  _react2.default.createElement(
                    'span',
                    null,
                    item.text
                  ),
                  _react2.default.createElement(
                    'span',
                    { name: 'likes', id: item._id, onClick: _this3.vote },
                    ' Like '
                  ),
                  item.votes.indexOf(_this3.state.clientId) > -1 ? _react2.default.createElement(
                    'span',
                    null,
                    'voted'
                  ) : _react2.default.createElement('span', null)
                );
              })
            ),
            _react2.default.createElement(
              'form',
              { onSubmit: this.sendQuestion, name: 'form' },
              _react2.default.createElement('input', { size: '50', name: 'question', placeholder: 'Question...' }),
              _react2.default.createElement('input', { type: 'submit', value: 'Send Question' })
            ),
            _react2.default.createElement(
              'button',
              { type: 'button', onClick: this.prev.bind(this) },
              'Lobby'
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react.Component);

var root = document.getElementById('root');
_reactDom2.default.render(_react2.default.createElement(App, null), root);