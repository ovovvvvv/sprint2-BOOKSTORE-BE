const conn = require('../mariadb') 
const {StatusCodes} = require('http-status-codes'); 
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto'); 
const dotenv = require('dotenv'); 
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

            if(loginUser && loginUser.password == hashPassword) {
                // 토큰 발행
                const token = jwt.sign({
                    id: loginUser.id,
                    email : loginUser.email
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '3m', 
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
                    // 이메일 초기화를 위해 이메일을 보내줍니다
                    email : email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
    })
};
    
    
const passwordReset = (req, res) => {
    const { email, password } = req.body;

    // 새 비밀번호를 암호화
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    // 이전 비밀번호 가져오기
    let sql = `SELECT password, salt FROM users WHERE email = ?`;

    conn.query(sql, email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const beforePassword = results[0].password;
        const beforeSalt = results[0].salt;

   
        const hashedInputPassword = crypto.pbkdf2Sync(password, beforeSalt, 10000, 10, 'sha512').toString('base64');

        if (beforePassword === hashedInputPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "비밀번호가 이전과 동일합니다. 다른 비밀번호를 입력해주세요."
            });
        } else {
            // 새 비밀번호로 업데이트
            let updateSql = `UPDATE users SET password = ?, salt = ? WHERE email = ?`;
            let values = [hashPassword, salt, email];

            conn.query(updateSql, values, (updateErr, updateResults) => {
                if (updateErr) {
                    console.log(updateErr);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }
                if (updateResults.affectedRows === 0) {
                    return res.status(StatusCodes.BAD_REQUEST).end();
                } else {
                    return res.status(StatusCodes.OK).json(updateResults);
                }
            });
        }
    });
};


module.exports = {
    join, 
    login, 
    passwordResetRequest, 
    passwordReset
};