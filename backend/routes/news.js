const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET all articles
router.get('/', newsController.getAllArticles);

// POST new article
router.post('/', newsController.createArticle);

// GET archive articles
router.get('/archive', newsController.getArchivedArticles);

// GET cold articles
router.get('/cold', newsController.getColdArticles);

// unified lookup by id across all collections:
router.get('/:id', newsController.getArticlesById);

module.exports = router;