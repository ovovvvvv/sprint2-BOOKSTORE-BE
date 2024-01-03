const express = require('express');
const { allBooks, bookDetail, booksByCategory } = require('../controller/bookController');
const router = express.Router();

router.use(express.json());

router.get('/',allBooks )
router.get('/:id', bookDetail)


module.exports = router