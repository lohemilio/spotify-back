const mongoose = require('mongoose')

const artistSchema = new mongoose.Schema({
    artistsList: {
    type: [String],
    required: true
  },
  
})

const Artists = mongoose.model('Artists', artistSchema)

module.exports = Artists
