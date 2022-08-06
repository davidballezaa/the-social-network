const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const helmet = require("helmet");
const morgan = require("morgan");

const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

const app = express();

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection was succesful");
});

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);

app.listen(3001, () => {
  console.log("Backend server is running on port 3001");
});
