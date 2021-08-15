// Main starting file
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const cors = require("cors");

const { log } = require("../src/commons/logger/app");

const Mongoose = require("mongoose").Mongoose; // to make diff instance of mongoose as we have to connect 2 db

let mongoose = new Mongoose();
mongoose.connect(process.env.MONGO_DB_DEN, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

const {init, extend} = require("../src");

const app = express();

const router = express.Router();

/* required for EJS */
const morgan = require("morgan");
app.use(morgan("combined"));


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

app.use("/", router);

init(mongoose, null, router, {});

let EmployeeSchema = require("../src/db/models/test/employee");

EmployeeSchema = extend({name: "employee", schema: EmployeeSchema, metamodels: ["data", "tags"], inlineWithObject: true});

let EmployeeModel = mongoose.model("employee", EmployeeSchema);



app.listen(process.env.APIPORT, () => {
  log.info(`Server started on ${process.env.APIPORT}`);
});
