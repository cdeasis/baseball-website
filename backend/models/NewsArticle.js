const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true},
    summary: { type: String, required: true},
    blurb: { type: String },
    author: { type: String },
    source: { type: String },
    publishedDate: { type: Date },
    image: { type: String },
}, { collection: 'newsarticles'} );

module.exports = mongoose.model('NewsArticle', articleSchema);