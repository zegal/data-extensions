const { loadModels } = require("./commons/database/app");
const { initRouter } = require("./api/http/routes/router");

const { extendMetaData, extendMetaDataDefinitions } = require("../src/lib");

/* loadModels and setup the router */
const init = function (database, router, routerOptions) {
  loadModels(database, "data");
  loadModels(database, "definitions");
  initRouter(router, routerOptions);
};

module.exports = {
  init,
  extendMetaData,
  extendMetaDataDefinitions,
};
