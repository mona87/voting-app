const mongoose = require('mongoose');


const pollSchema = mongoose.Schema({
    question: String,
    options: [],
    owner: String,
    url: String,
    date: { type: Date, default: Date.now },
    voted: [],
    
});


module.exports = mongoose.model('Poll',pollSchema);