const express = require('express');
const router = express.Router();
const LiveNewsArticle = require('../models/LiveNewsArticles');
const { Types } = require('mongoose');

// GET /api/news -> Today & Yesterday (bucket = LIVE)
router.get('/', async (req, res) => {
    const limit = Math.min(Number(req.query.limit || 200), 500);
    const docs = await LiveNewsArticle.find({ bucket: 'LIVE'}).sort({ publishedAt: -1, sourceRank: -1, title: 1}).limit(limit).lean();

    const out = docs.map(d => ({
        id: d._id.toString(),
        title: d.title,
        image: d.images?.lead || null,
        summary: d.summary?.short || d.summary?.long || (d.raw?.text || '').slice(0, 260),
        author: d.author || '',
        source: d.source,
        publishedDate: d.publishedAt,
    }));
    res.json(out);
});

// GET /api/news/archive -> 2 to 30 days ago (bucket = ARCHIVE)
router.get('/archive', async (req, res) => {
    const docs = await LiveNewsArticle.find({ bucket: 'ARCHIVE'}).sort({ publishedAt: -1}).limit(1000).lean();

    const out = docs.map(d => ({
        id: d._id.toString(),
        title: d.title,
        image: d.images?.lead || null,
        summary: d.summary?.short || d.summary?.long || (d.raw?.text || '').slice(0, 260),
        author: d.author || '',
        source: d.source,
        publishedDate: d.publishedAt,
        isArchived: true,
    }));
    res.json(out);
});

// GET /api/news/cold[?q=...] -> return recent cold if no q; search if q present
router.get('/cold', async (req, res) => {
    const q = (req.query.q || '').trim();

    if (!q) {
        // return a small recent slice so Archive page can reload + filter
        const docs = await LiveNewsArticle.find({ bucket: 'COLD'}).sort({ publishedAt: -1}).limit(200).lean();

        return res.json(docs.map( d=> ({
            id: d._id.toString(),
            title: d.title,
            image: d.images?.lead || null,
            summary: d.summary?.short || d.summary?.long || (d.raw?.text || '').slice(0, 260),
            author: d.author || '',
            source: d.source,
            publishedDate: d.publishedAt,
            isArchived: false,
        })));
    }

    // text search when q is provided
    const docs = await LiveNewsArticle.find( { bucket: 'COLD', $text: { $search: q } }, { score: { $meta: 'textScore' } } ).sort({ score: { $meta: 'textScore' }, publishedAt: -1 }).limit(200).lean();

    res.json(docs.map(d => ({
        id: d._id.toString(),
        title: d.title,
        image: d.images?.lead || null,
        summary: d.summary?.short || d.summary?.long || (d.raw?.text || '').slice(0, 260),
        author: d.author || '',
        source: d.source,
        publishedDate: d.publishedAt,
        isArchived: false,
    })));
});

// GET /api/news/:id -> detail
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Not Found' });
    }

    const doc = await LiveNewsArticle.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'Not Found' });

    res.json({
        id: doc._id.toString(),
        title: doc.title,
        source: doc.source,
        author: doc.author || '',
        publishedDate: doc.publishedAt,
        image: doc.images?.lead || null,
        summary: doc.summary?.long || doc.summary?.short || (doc.raw?.text || ''),
        blurb: '',
        url: doc.url,
    });
});

module.exports = router;