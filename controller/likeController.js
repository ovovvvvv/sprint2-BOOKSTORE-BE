const jwt = require('jsonwebtoken');
const conn = require('../mariadb') // db 모듈
const {StatusCodes} = require('http-status-codes'); // status code 모듈
const dotenv = require('dotenv'); // dotenv 모듈
dotenv.config();

const addLike = (req, res) => {
    const book_id = req.params.id; // book_id
  
    let authorization = ensureAuthorization(req);

    let sql = "INSERT INTO likes (user_id, liked_book_id) VALUES(?, ?)";
    let values = [authorization.id, book_id];

    conn.query(sql, values,
        (err, results ) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        })
    };


const removeLike = (req, res) => {
    const book_id = req.params.id;

   let authorization = ensureAuthorization(req);
   
    let sql = "DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?";
    let values = [authorization.id, book_id];

    conn.query(sql, values,
        (err, results ) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        })
}

const ensureAuthorization = (req) => {
    let receivedJwt = req.headers["authorization"];
    console.log("received jwt : " ,receivedJwt)

    let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY)
    console.log(decodedJwt);

    return decodedJwt;
}

module.exports = {
    addLike, removeLike
}