const connectDatabase = () => {
  const mongoose = require("mongoose");
  mongoose
    .connect(process.env.DB_URI)
    .then((data) => {
      console.log("connect");
    })
    .catch((err) => {
      console.log(err)
      console.log("connection error");
    });
};
module.exports = connectDatabase;
