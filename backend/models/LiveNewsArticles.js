const mongoose = require('mongoose');

const LiveNewsArticleSchema = new mongoose.Schema({
    source: String,
    // keep url indexed (fast lookups), but not unique
    url: { type: String, index: true, unique: true },
    // enfore uniqueness on canonicalized version
    canonicalUrl: { type: String, index: true, unique: true},
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
    images: { lead: String},

    bucket: { type: String, enum: ['LIVE', 'ARCHIVE', 'COLD'], index: true, default: 'LIVE' },
    sourceRank: { type: Number, default: 50 }, // tie-break
    ingestedAt: { type: Date, default: Date.now }

}, { collection: 'LiveNewsArticles', timestamps: true });

// query-speed indexes
LiveNewsArticleSchema.index({ bucket: 1, publishedAt: -1 });
LiveNewsArticleSchema.index({ source: 1, publishedAt: -1 });

// single text index combining fields
LiveNewsArticleSchema.index({ title: 'text', 'raw.text': 'text' }); // for search

module.exports = mongoose.model('LiveNewsArticle', LiveNewsArticleSchema);