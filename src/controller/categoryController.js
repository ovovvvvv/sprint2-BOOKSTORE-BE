const conn = require("../../mariadb"); // db 모듈
const { StatusCodes } = require("http-status-codes"); // status code 모듈

const allCategory = (req, res) => {
  // 카테고리 전체 목록 리스트

  let sql = `SELECT * FROM category`;
  conn.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    console.log(results);
    return handleResult(res, results);
  });
};

const handleResult = (res, results) => {
  if (results.length) {
    results.map((result) => {
      result.categoryId = result.category_id;
      delete result.category_id;
      result.categoryName = result.category_name;
      delete result.category_name;
    });
    return res.status(StatusCodes.OK).json(results);
  } else {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
};

module.exports = {
  allCategory,
};
