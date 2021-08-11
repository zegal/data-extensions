const infoHandler = require("../../handlers/info/info.handler");
const unknownMethodHandler = require("../../handlers/unknownMethod/unknownMethod.handler");

const express = require("express");
const infoRouter = express.Router();

// Register handlers here
infoRouter.route("/info").get(infoHandler.getAppInfo);

// This handler will run last and generate 405 method not allowed error
infoRouter.all("/info", unknownMethodHandler.methodNotAllowed);

module.exports = infoRouter;
