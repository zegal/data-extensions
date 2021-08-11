// Main starting file
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const cors = require("cors");

const { log } = require("./commons/logger/app");
const router = require("./api/http/routes/router");

const app = express();

/* required for EJS */
const morgan = require("morgan");
app.use(morgan("combined"));

app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "./public")));

// Init connection;
require("./commons/database/app");

//allow CORS on all requests

const corsOptions = {
  origin: true,
  methods: "GET,PUT,PATCH,POST,DELETE,OPTIONS",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-MD5",
    "Content-Type",
    "Content-Disposition",
    "Date",
    "Origin",
    "X-Dragon-Law-API-Version",
    "X-Dragon-Law-App",
    "X-Dragon-Law-Username",
    "X-Dragon-Law-Dragonball",
    "X-Dragon-Law-Token",
    "X-Dragon-Law-Cloud-User",
  ],
  maxAge: 86400, //24h, as firefox max, but chromium max will be 2h
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("*", router);

app.listen(process.env.APIPORT, () => {
  log.info(`Server started on ${process.env.APIPORT}`);
});
