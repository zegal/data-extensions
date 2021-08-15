const { loadModels } = require("./commons/database/app");
const { initRouter } = require("./api/http/routes/router");

const { extend } = require("../src/lib");

/* loadModels and setup the router */
const init = function (database, databaseOptions, router, routerOptions) {
  loadModels(database, databaseOptions);
  initRouter(router, routerOptions);
};

module.exports = {
  init,
  extend,
};
