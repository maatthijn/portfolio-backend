const mongoose = require('mongoose');
const gallerySchema = new mongoose.Schema({
    name: String,
    description: {
        type: String,
        default: "Matthijn's Picture."
    },
    url: String,
    public_id: String,
    dateCreated: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);