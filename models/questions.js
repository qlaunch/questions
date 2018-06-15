'use strict';

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: String,
  votes: [],
  timestamp: {type: Date, default: Date.now},
  room: String
});

module.exports = mongoose.model('Question', QuestionSchema);