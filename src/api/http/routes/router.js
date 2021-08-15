/**
 * Index Router File
 * Lists all the routes of the API
 * Hanldes 404 routes
 */

const { models } = require("../../../commons/database/app");

let router;
let routerOptions;
function initRouter(_router, _routerOptions) {
  console.log("initRouter");
  router = _router;
  routerOptions = _routerOptions;

  router.get("/fieldDefinition/:id", (req) => {
    console.log("GET fieldDefinition", req.params.id);
  });
  router.post("/fieldDefinition", (req) => {
    console.log("POST fieldDefinition", req.body);
  });

  router.put("/fieldDefinition/:id", (req) => {
    console.log("PUT fieldDefinition", req.params.id, req.body);
  });
}

async function getMeta(schemaName, id, key) {
  return { schemaName, id, key };
}

async function saveMeta(schemaName, id, key, body) {
  return { schemaName, id, key, body };
}

function addSchema(schemaName) {
  for (const key in models) {
    console.log("setting up routes for", schemaName, key);
    router.get(`/${schemaName}/:id/${key}`, async (req, res) => {
      console.log("get", schemaName, key, req.params.id);
      let response = await getMeta(schemaName, req.params.id, key);
      res.send(response);
    });
    router.put(`/${schemaName}/:id/${key}`, async (req, res) => {
      console.log("put", schemaName, key, req.params.id, req.body);
      let response = await saveMeta(schemaName, req.params.id, key, req.body);
      res.send(response);
    });
  }
  router.put(`${routerOptions && routerOptions.root}/searchMeta`, (req) => {
    console.log("put searchMeta", schemaName, req.body);
  });
}

module.exports = {
  initRouter,
  addSchema,
};
