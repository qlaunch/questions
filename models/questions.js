'use strict';

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: String,
  votes: Number,
  timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Question', QuestionSchema);