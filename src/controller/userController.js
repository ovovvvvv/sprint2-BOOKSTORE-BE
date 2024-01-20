const conn = require('../mariadb') 
const {StatusCodes} = require('http-status-codes'); 
const jwt = require('jsonwebtoken'); 
const { encryptPassword } = require('../utils/encryption');
const dotenv = require('dotenv'); 
dotenv.config();


const join = (req, res) => {
    const {email, password} = req.body;

    const { hashedPassword, salt} = encryptPassword(password);

    let sql = `INSERT INTO users(email, password, salt) VALUES(?, ?, ?)`

    console.log(hashedPassword);

    let values = [email, hashedPassword, salt];
    conn.query(sql, values,
        (err, results) => {
            if(err){
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if(results.affectedRows){
                res.status(StatusCodes.CREATED).json(results);
            } else {
                return res.status(StatusCodes.BAD_REQUEST).end(); 
            }
        });
    };

    const login = (req, res) => {
        const { email, password } = req.body;
    
        let sql = 'SELECT * FROM users WHERE email = ?';
    
        conn.query(sql, email, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal Server Error'
                });
            }
    
            if (!results || results.length === 0) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    error: 'Invalid credentials'
                });
            }
    
            const loginUser = results[0];
            const { hashedPassword } = encryptPassword(password, loginUser.salt);
    
            if (loginUser.password === hashedPassword) {
                const token = jwt.sign({
                    id: loginUser.id,
                    email: loginUser.email
                }, process.env.PRIVATE_KEY, {
                    expiresIn: '10m',
                    issuer: "yoojin"
                });
    
                res.cookie("token", token, {
                    httpOnly: true
                });
    
                console.log(results);
                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    error: 'Invalid credentials'
                });
            }
        });
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
