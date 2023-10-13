const express = require("express");
const errorMiddleware = require("./middleware/error");
const product = require("./routes/product");
const user = require("./routes/user");
const cookieParser = require("cookie-parser");
const order = require("./routes/order");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api", product);
app.use("/api", user);
app.use("/api", order);
app.use(errorMiddleware);

module.exports = app;
