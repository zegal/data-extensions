const Mongoose = require("mongoose").Mongoose; // to make diff instance of mongoose as we have to connect 2 db
const fs = require("fs");
const { log } = require("../logger/app");

const connEnvVariables = {
  den: process.env.MONGO_DB_DEN,
};

let databases = {};
let models = {};
let schemas = {};

const MODEL_DIR = "../../db/models/";
let modelsDir = __dirname + "/" + MODEL_DIR;

function createConnection(key, uri) {
  console.log(`Creating connection for: ${key}`);
  let mongoose = new Mongoose();
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  let connection = mongoose.connection;

  connection.on("error", function (err) {
    log.info(err, `${key}: Mongo connection error`);
  });

  connection.on("connecting", function () {
    log.info(`${key}: Connecting to MongoDB...`);
  });

  connection.on("connected", function () {
    log.info(`${key}: Connected`);
  });
  connection.on("reconnected", function () {
    log.info(`${key}: MongoDB reconnected!`);
  });

  connection.on("disconnected", function () {
    log.info(`${key}: MongoDB disconnected!`);
  });

  return mongoose;
}

function loadModels(mongoose, dir = `${modelsDir}den`) {
  console.log("loadModels", dir);
  fs.readdirSync(dir).forEach(function (file) {
    let schemaName = file.split(".")[0];
    const schemaFile = dir + "/" + schemaName;
    const schema = require(schemaFile);

    // schema names are lower case
    schemas[schemaName] = schema;
    models[schemaName] = mongoose.model(schemaName, schema);
  });
}

function init({loadModels = true}) {
  for (let key in connEnvVariables) {
    let uri = connEnvVariables[key];
    let mongoose = createConnection(key, uri);

    if(loadModels)
      loadModels(mongoose, modelsDir + key);
    databases[key] = mongoose;
  }
}


module.exports = { init, loadModels, databases, schemas, models };
