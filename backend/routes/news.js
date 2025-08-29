const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const LiveNewsArticle = require('../models/LiveNewsArticles');

// existing routes (archive/cold/etc.)
router.get('/', newsController.getAllArticles);
router.post('/', newsController.createArticle);
router.get('/archive', newsController.getArchivedArticles);
router.get('/cold', newsController.getColdArticles);

// live feed (latest first)
router.get('/live', async (req, res) => {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const docs = await LiveNewsArticle.find().sort({ publishedAt: -1, _id: -1 }).limit(limit);
    res.json(docs);
});

// live by id
router.get('/live/:id', async (req, res) => {
    const doc = await LiveNewsArticle.findById(req.params.id);
    if (!doc) {
        return res.status(404).json({ error: 'Article not found' });
    }
    res.json(doc);
});

module.exports = router;