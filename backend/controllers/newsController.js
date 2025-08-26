const NewsArticle = require('../models/NewsArticle');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// get all articles
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await NewsArticle.find().sort({ publishedDate: -1 });
        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching articles.' });
    }
};

// create new article
exports.createArticle = async (req, res) => {
    const { title, summary, blurb, author, source, publishedDate, image } = req.body;

    const newArticle = new NewsArticle ({
        title,
        summary,
        blurb,
        author,
        source,
        publishedDate,
        image,
    });
    
    try {
        await newArticle.save();
        res.status(201).json({ message: 'Article created successfully', article: newArticle });
    } catch(error) {
        res.status(500).json({ message: 'Error saving article' });
    }
};

// get archived articles (last month -> day before yesterday)
exports.getArchivedArticles = async (req, res) => {
    try {
        const archivedCollection = mongoose.connection.collection('ArchiveArticles');
        const archivedArticles = await archivedCollection.find().sort({ publishedDate: -1 }).toArray();
        res.json(archivedArticles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching archived articles'});
    }
};

// get cold articles (>1 month)
exports.getColdArticles = async (req, res) => {
    try {
        const coldCollection = mongoose.connection.collection('ColdArticles');
        const coldArticles = await coldCollection.find().sort({ publishedDate: -1 }).toArray();
        res.json(coldArticles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fecthing cold articles'});
    }
};

exports.getArticlesById = async (req, res) => {
    try {
        const { id } = req.params;

        // build query candidates: numeric id and/or _id
        const numericId = Number(id);
        const candidates = [];

        if (!Number.isNaN(numericId)) {
            candidates.push({ id: numericId });
        }
        // accept 24-hex as ObjectId
        if (/^[a-f\d]{24}$/i.test(id)) {
            candidates.push({ _id: new ObjectId(id) });
        }

        if (candidates.length === 0) {
            return res.status(400).json({ error: 'Invalid id format' });
        }

        // 1. main collection (Mongoose model)
        for (const q of candidates) {
            const doc = await NewsArticle.findOne(q);
            if (doc) return res.json({ ...doc.toObject(), collection: 'main' });
        }

        // helper to try a raw collection
        const tryCollection = async (names) => {
            for (const name of names) {
                const col = mongoose.connection.collection(name);
                for (const q of candidates) {
                    const d = await col.findOne(q);
                    if (d) return { d, name };
                }
            }
            return null;
        };

        // 2. archive -> 3. cold
        const hit = await tryCollection(['ArchiveArticles', 'ColdArticles']);
        if (hit) {
            const collection = hit.name === 'ArchiveArticles' ? 'archive' : 'cold';
            return res.json({ ...hit.d, collection});
        }

        return res.status(404).json({ error: 'Not Found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lookup failed '});
    }
}