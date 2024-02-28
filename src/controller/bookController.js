const ensureAuthorization = require("../../auth");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const conn = require("../../mariadb"); // db 모듈

const allBooks = async (req, res) => {
  let allBooksRes = {};
  let { category_id, newBook, limit, currentPage } = req.query;

  let offset = limit * (currentPage - 1);

  let sql =
    "SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes FROM books";
  let values = [];

  if (category_id && newBook) {
    sql +=
      " WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    values.push(category_id);
  } else if (category_id) {
    sql += " WHERE category_id = ?";
    values.push(category_id);
  } else if (newBook) {
    sql +=
      " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
  }
  sql += " LIMIT ? OFFSET ?";
  values.push(parseInt(limit), offset);

  try {
    const [results] = await conn.promise().query(sql, values);

    if (results.length) {
      results.forEach((result) => {
        result.pubDate = result.pub_date;
        delete result.pub_date;
        result.categoryId = result.category_id;
        delete result.category_id;
      });
      allBooksRes.books = results;
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    const [totalCount] = await conn.promise().query("SELECT found_rows()");

    let pagination = {};
    pagination.currentPage = parseInt(currentPage);
    pagination.totalCount = totalCount[0]["found_rows()"];

    allBooksRes.pagination = pagination;

    return res.status(StatusCodes.OK).json(allBooksRes);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

const bookDetail = (req, res) => {
  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요.",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    let book_id = req.params.id;

    let sql = `SELECT books.*, category.*, 
                        (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes,
                        (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked
                        FROM books
                        LEFT JOIN category
                        ON books.category_id = category.category_id
                        WHERE books.id=?;`;

    let values = [authorization.id, book_id, book_id];
    if (authorization instanceof ReferenceError) {
      sql = `SELECT books.*, category.*, 
                        (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
                        FROM books
                        LEFT JOIN category
                        ON books.category_id = category.category_id
                        WHERE books.id=?;`;
      values = [book_id];
    }
    bookDetailQuery(res, sql, values);
  }
};
const handleResult = (res, results) => {
  if (results.length) {
    let result = results[0];
    result.pubDate = result.pub_date;
    delete result.pub_date;
    result.categoryId = result.category_id;
    delete result.category_id;
    result.categoryName = result.category_name;
    delete result.category_name;
    result.likes = result.likes;
    return res.status(StatusCodes.OK).json(result);
  } else {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
};

const bookDetailQuery = (res, sql, values) => {
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    handleResult(res, results);
  });
};

module.exports = {
  allBooks,
  bookDetail,
};
