const conn = require('../mariadb') // db 모듈
const {StatusCodes} = require('http-status-codes'); // status code 모듈
const jwt = require('jsonwebtoken'); // 토큰을 발급받기 위해 필요한 모듈
const crypto = require('crypto'); // crypto 모듈, nodejs 기본 모듈로 암호화 담당
const dotenv = require('dotenv'); // dotenv 모듈
dotenv.config();


const join = (req, res) => {
    const {email, password} = req.body;

    let sql = `INSERT INTO users(email, password, salt) VALUES(?, ?, ?)`


    // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와, salt값을 같이 db에 저장
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    console.log(hashPassword);

    let values = [email, hashPassword, salt];
    conn.query(sql, values,
        (err, results) => {
            if(err){
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            res.status(StatusCodes.CREATED).json(results)
        });
    };

const login = (req, res) => {
    const {email, password} = req.body;

    let sql = 'SELECT * FROM users WHERE email = ?';
    conn.query(sql, email,
        (err, results) => {
            if(err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            } 

            const loginUser = results[0];

        // salt 값 꺼내서 날것으로 들어온 비밀번호를 암호화 해보고
        const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

        // => 디비 비밀번호와 비교
            // results에 select의 값이 들어있을거고, 이메일을 가진 친구는 1명이기 떄문에 0번째를 가져다 씁니다.
            if(loginUser && loginUser.password == hashPassword) {
                // 토큰 발행
                const token = jwt.sign({
                    email : loginUser.email
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '5m', 
                    issuer : "yoojin"
                });

                // 토큰 쿠키에 담기
                res.cookie("token", token, {
                    httpOnly : true
                });
                console.log(token);

                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.UNAUTHORIZED)
                // 401 : Unauthorized, 403 : Forbidden 
            }
        })
    };


const passwordResetRequest = (req, res) => {
    const {email} = req.body;

    let sql = 'SELECT * FROM users WHERE email = ?';

    conn.query(sql, email,
        (err, results) => {
            if(err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            } 

            // 이메일로 유저가 있는지 찾아보기
            const user = results[0];
            if (user) {
                return res.status(StatusCodes.OK).json({
                    // 이메일 초기화를 위해 이메일을 보내줄것임
                    email : email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
    })
};
    
    
const passwordReset = (req, res) => {
   const {email, password} = req.body;

// 이전 비밀번호 가져오기
   let sql = `SELECT password FROM users WHERE email = ?`;

   conn.query(sql, email, 
    (err, results) => {
        if(err){
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        } 
        const beforePassword = results[0].password;

          // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와, salt값을 같이 db에 저장
          const salt = crypto.randomBytes(10).toString('base64');
          const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

        if (beforePassword == password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message : "비밀번호가 이전과 동일합니다. 다른 비밀번호를 입력해주세요."
            })
        } else {
            // 새 비밀번호로 업데이트
            let updateSql = `UPDATE users SET password = ?, salt = ? WHERE email = ?`;
            let values = [hashPassword, salt, email];

            conn.query(updateSql, values,
                (updateErr, updateResults) => {
                    if (updateErr) {
                        console.log(updateErr);
                        return res.status(StatusCodes.BAD_REQUEST).end();
                    }
                    if (results.affectedRows == 0){
                        return res.status(StatusCodes.BAD_REQUEST).end();
                    } else {
                        return res.status(StatusCodes.OK).json(updateResults);
                    }
                })
        }
    })
};   

module.exports = {
    join, 
    login, 
    passwordResetRequest, 
    passwordReset
};