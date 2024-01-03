const { STATUS_CODES } = require('http');
const conn = require('../mariadb') // db 모듈
const {StatusCodes} = require('http-status-codes'); // status code 모듈

const allBooks = (req, res) => {
    let {category_id} = req.query;

    if (category_id) {
        let sql = `SELECT * FROM books WHERE category_id = ?`;
        conn.query(sql, category_id, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if (results.length) {
                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }
    })
} else {    
    let sql = `SELECT * FROM books`
    conn.query(sql, (err, results ) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
           return res.status(StatusCodes.OK).json(results);
        })
    };
}


const bookDetail = (req, res) => {
    let {id} = req.params;
    id = parseInt(id);

    let sql = `SELECT * FROM books WHERE id = ?`;
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