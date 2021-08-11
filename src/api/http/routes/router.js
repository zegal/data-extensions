/**
 * Index Router File
 * Lists all the routes of the API
 * Hanldes 404 routes
 */

const express = require("express");
const router = express.Router();

// import all the routes
const infoRouter = require("./infoRouter/info.router");
const notFoundHandler = require("../handlers/notFound/notFound.handler");

// Register the routes
router.all("/info", infoRouter);

// Fill in other routes
// If nothing processed from above, the 404 response will be generated
router.all("*", notFoundHandler.notFound);

module.exports = router;
