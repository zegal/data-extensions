// Main starting file
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const cors = require("cors");

const logger  = require("../src/commons/logger/app");

const Mongoose = require("mongoose").Mongoose; // to make diff instance of mongoose as we have to connect 2 db

const {ObjectId} = require("mongodb");

let mongoose = new Mongoose();
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

const {init, extendMetaData} = require("../src");

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

init(mongoose, router, {middleware: [(res, req, next) => {console.log("caught"); next();}]});

let EmployeeSchema = require("../src/db/models/test/employee");

const options = require("./employee-options");
EmployeeSchema = extendMetaData({name: "employee", 
                                 schema: EmployeeSchema, 
                                 metamodels: ["tags", "data"], 
                                 options: options});


let EmployeeModel = mongoose.model("employee", EmployeeSchema);

app.use("/employee/:id", async (req, res) => {
  let result = await EmployeeModel.findOne({_id: ObjectId(req.params.id)});
  res.send(result);
})

router.put("/employee/search", async (req, res) => {
  console.log("search", req.body);
  EmployeeModel.metasearch = "Bob"
  if(req.body) {
    let result = await EmployeeModel.find(req.body);
    res.send(result);
  } else {
    res.send({});
  }
})


app.listen(process.env.APIPORT, () => {
  logger.info(`Server started on ${process.env.APIPORT}`);
});
