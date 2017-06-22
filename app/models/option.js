const mongoose = require('mongoose');


const optionSchema = mongoose.Schema({
    questionId: String,
    question: String,
    answer: String,
    votes: Number,
    owner: String,
    voted: [],
    
});


module.exports = mongoose.model('Option',optionSchema);