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
  return await models[key]
    .findOne({
      origin: schemaName,
      refId: ObjectId(id),
    })
    .lean();
}

async function saveMeta(schemaName, id, key, body) {
  return await models[key].findOneAndUpdate(
    {
      origin: schemaName,
      refId: ObjectId(id),
    },
    { [key]: body },
    { new: true, upsert: true }
  );
}

function addSchema(schemaName, options) {
  let schemaRoot = "/" + schemaName;
  if (options && options.root) {
    schemaRoot = options.root;
  }

  for (const key in models) {
    // see if key is overridden;
    let keyPath = (options[key] && options[key].schemaName) || key;

    if (router) {
      router.get(
        `${schemaRoot}/:id/${keyPath}`,
        (routerOptions && routerOptions.middleware) || [],
        async (req, res) => {
          let response = await getMeta(schemaName, req.params.id, key);

          try {
            let { decorate } = require(`../../../lib/${key}`);
            response = await decorate(response, options);
          } catch (err) {
            //swallow exception to decorate
          }

          res.send(response);
        }
      );

      /* Get data based with context.*/
      router.get(
        `${schemaRoot}/:id/${keyPath}/:contextOrigin/:contextId`,
        (routerOptions && routerOptions.middleware) || [],
        async (req, res) => {
          let response = await getMeta(schemaName, req.params.id, key);

          try {
            let { decorate } = require(`../../../lib/${key}`);
            response = await decorate(
              response,
              options,
              req.params.contextOrigin,
              req.params.contextId
            );
          } catch (err) {
            //swallow exception to decorate
          }
          res.send(response);
        }
      );

      router.put(
        `${schemaRoot}/:id/${keyPath}`,
        (routerOptions && routerOptions.middleware) || [],
        async (req, res) => {
          console.log("put", schemaName, key, req.params.id, req.body);
          let response = await saveMeta(
            schemaName,
            req.params.id,
            key,
            req.body
          );
          if(routerOptions.eventEmitter && options.eventName){
            routerOptions.eventEmitter.emit( options.eventName, {
              id:   req.params.id,
              schemaRoot,
              keyPath,
              schemaName        
            });
          }
          res.send(response);
        }
      );

      try {
        require(`./${key}Router`)(
          router,
          schemaRoot,
          routerOptions,
          options[key]
        );
      } catch (err) {
        console.log("no special routes found for", key);
      }
    }
  }
  if (router) {
    router.put(`${schemaRoot}/searchMeta`, (req) => {
      console.log("put searchMeta", schemaName, req.body);
    });
  }
}

module.exports = {
  initRouter,
  addSchema,
};
