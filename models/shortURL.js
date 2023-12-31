const mongoose = require('mongoose');
const shortId = require('shortid');

const shortURLSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  }
});

const ShortURL = mongoose.model('ShortURL', shortURLSchema);
module.exports = ShortURL;
