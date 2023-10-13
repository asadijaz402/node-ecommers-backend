const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
dotenv.config({ path: "./config/config.env" });
connectDatabase();
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
