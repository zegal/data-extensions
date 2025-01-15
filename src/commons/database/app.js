const Mongoose = require("mongoose").Mongoose; // To create multiple instances of Mongoose
const fs = require("fs");
const { log } = require("../logger/app");

const connEnvVariables = {
  data: process.env.MONGO_DB_DATA,
  definitions: process.env.MONGO_DB_DEFINITIONS,
};

let databases = {};
let models = {};
let schemas = {};

const MODEL_DIR = "../../db/models/";
let modelsDir = __dirname + "/" + MODEL_DIR;

function createConnection(key, uri) {
  console.log(`Creating connection for: ${key}`);
  const mongoose = new Mongoose();

  mongoose.connect(uri).catch((err) => {
    log.error(err, `${key}: Failed to connect to MongoDB`);
  });

  const connection = mongoose.connection;

  connection.on("error", (err) => {
    log.error(err, `${key}: MongoDB connection error`);
  });

  connection.on("connecting", () => {
    log.info(`${key}: Connecting to MongoDB...`);
  });

  connection.on("connected", () => {
    log.info(`${key}: Connected to MongoDB`);
  });

  connection.on("reconnected", () => {
    log.info(`${key}: MongoDB reconnected!`);
  });

  connection.on("disconnected", () => {
    log.warn(`${key}: MongoDB disconnected`);
  });

  return mongoose;
}

function loadModels(mongoose, module = "data") {
  const dir = `${modelsDir}${module}`;
  fs.readdirSync(dir).forEach((file) => {
    const schemaName = file.split(".")[0];
    const schemaFile = dir + "/" + schemaName;

    const schema = require(schemaFile);

    // Schema names are stored in lowercase
    schemas[schemaName] = schema;
    models[schemaName] = mongoose.model(schemaName, schema);
  });
}

function init({ loadModels: shouldLoadModels = true }) {
  for (const key in connEnvVariables) {
    const uri = connEnvVariables[key];
    const mongoose = createConnection(key, uri);

    if (shouldLoadModels) loadModels(mongoose, key);
    databases[key] = mongoose;
  }
}

module.exports = { init, loadModels, databases, schemas, models };
