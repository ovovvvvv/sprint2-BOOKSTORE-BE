const { STATUS_CODES } = require('http');
const conn = require('../mariadb') // db 모듈
const {StatusCodes} = require('http-status-codes'); // status code 모듈

const allBooks = (req, res) => {
    let {category_id, newBook} = req.query;

    let sql = "SELECT * FROM books";
    let values = [];
  
    if(category_id && newBook){
        sql += " WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
        values = [category_id, newBook];
    } else if (category_id){
        sql += " WHERE category_id = ?";
        values = category_id;
    } else if (newBook){
        sql += " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
        values = newBook;
    }
    conn.query(sql, values,
        (err, results) => {
            if(err){
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if(results.length){
                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        }
    )}
    



const bookDetail = (req, res) => {
    let {id} = req.params;
    id = parseInt(id);

    let sql = `SELECT * FROM books LEFT JOIN category
    ON books.category_id = category.id WHERE books.id = ?`;
    conn.query(sql, id, (err, results ) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const book = results[0];
            if (book) {
                return res.status(StatusCodes.OK).json(book)
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        })
};


module.exports = {
    allBooks,
    bookDetail,
};