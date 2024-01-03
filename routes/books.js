const express = require('express');
const { allBooks, bookDetail } = require('../controller/bookController');
const router = express.Router();

router.use(express.json());

router.get('/',allBooks ) // 전체 도서 조회 & 카테고리별 도서 조회
router.get('/:id', bookDetail)


module.exports = router