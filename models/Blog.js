const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    author: {
        type: String,
        require: true
    },
    datetime: {
        type: Date,
        default: Date.now
    },
    paragraphs: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('Blog', blogSchema);