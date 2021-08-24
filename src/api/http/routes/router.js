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
    router.get("/fieldDefinition/:id", (req, res) => {
      console.log("GET fieldDefinition", req.params.id);
      res.send(req.params.id);
    });

    router.get("/fieldDefinition/byCode/:code", (req, res) => {
      console.log("GET fieldDefinition byCode", req.params.code);
      res.send(req.params.code);
    });

    router.post("/fieldDefinition", (req, res) => {
      console.log("POST fieldDefinition", req.body);
      res.send(req.body);
    });

    router.put("/fieldDefinition/:id", (req, res) => {
      console.log("PUT fieldDefinition", req.params.id, req.body);
      res.send(req.body);
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

function addSchema(schemaName, options) {
  let schemaRoot = "/" + schemaName;
  if (routerOptions && routerOptions.root) {
    schemaRoot = routerOptions.root + "/" + schemaName;
  }
  for (const key in models) {
    if (router) {
      console.log("setting up default metadata routes for", schemaName, key);
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

      console.log("setting up specific routes");
      try {
        require(`./${key}Router`)(router, schemaRoot, options[key]);
      } catch (err) {
        console.log("no special routes found for", key);
      }
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
