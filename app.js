const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.listen(process.env.PORT);

const userRouter = require("./src/routes/users");
const bookRouter = require("./src/routes/books");
const categoryRouter = require("./src/routes/category");
const cartRouter = require("./src/routes/carts");
const likeRouter = require("./src/routes/likes");
const orderRouter = require("./src/routes/orders");

app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/category", categoryRouter);
app.use("/likes", likeRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
