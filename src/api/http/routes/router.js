/**
 * Index Router File
 * Lists all the routes of the API
 * Hanldes 404 routes
 */

const { models } = require("../../../commons/database/app");

const { ObjectId } = require("mongodb");

let router;
let routerOptions;
function initRouter(_router, _routerOptions) {
  console.log("initRouter");
  router = _router;
  routerOptions = _routerOptions;

  if (router) {
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
}

async function getMeta(schemaName, id, key) {
  return await models[key].findOne({
    origin: schemaName,
    refId: ObjectId(id),
  });
}

async function saveMeta(schemaName, id, key, body) {
  return { schemaName, id, key, body };
}

function addSchema(schemaName) {
  let schemaRoot = "/" + schemaName;
  if (routerOptions && routerOptions.root) {
    schemaRoot = routerOptions.root + "/" + schemaName;
  }
  for (const key in models) {
    if (router) {
      console.log("setting up routes for", schemaName, key);
      router.get(`${schemaRoot}/:id/${key}`, async (req, res) => {
        console.log("get", schemaName, key, req.params.id);
        let response = await getMeta(schemaName, req.params.id, key);
        res.send(response);
      });
      router.put(`${schemaRoot}/:id/${key}`, async (req, res) => {
        console.log("put", schemaName, key, req.params.id, req.body);
        let response = await saveMeta(schemaName, req.params.id, key, req.body);
        res.send(response);
      });
    }
  }
  if (router) {
    router.put(`${routerOptions && routerOptions.root}/searchMeta`, (req) => {
      console.log("put searchMeta", schemaName, req.body);
    });
  }
}

module.exports = {
  initRouter,
  addSchema,
};
