const mongoose = require('mongoose');

const LiveNewsArticleSchema = new mongoose.Schema({
    source: String,
    url: { type: String, index: true, unique: true },
    canonicalUrl: String,
    title: String,
    author: String,
    publishedAt: Date,
    fetchedAt: { type: Date, default: Date.now },

    raw: {
        text: String,
        html: String,
    },

    summary: {
        short: String,
        long: String,
        model: String,
        generatedAt: Date,
    },

    tags: [String],
    images: { lead: String}

}, { collection: 'LiveNewsArticles', timestamps: true });

module.exports = mongoose.model('LiveNewsArticle', LiveNewsArticleSchema);