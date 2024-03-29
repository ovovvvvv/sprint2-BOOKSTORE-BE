const crypto = require("crypto");

const encryptPassword = (password, salt) => {
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  return { hashedPassword, salt };
};

const encryptPassword2 = (password, salt) => {
  if (!salt) salt = crypto.randomBytes(16).toString("base64");

  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  return { hashedPassword, salt };
};

module.exports = { encryptPassword };
