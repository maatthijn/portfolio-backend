const mongoose = require('mongoose');
const gallerySchema = new mongoose.Schema({
    name: String,
    description: String,
    url: String,
    dateCreated: Date,
});

module.exports = mongoose.model('Gallery', gallerySchema);