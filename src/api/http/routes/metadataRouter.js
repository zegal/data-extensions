const {
  getFieldDefinition,
  saveFieldDefinition,
} = require("../../../lib/metadata");
module.exports = (router, schemaRoot, routerOptions, options) => {
  /* Get fieldDefinition based on a baseDefinition and a parent context; create one if does not exist.*/
  router.get(
    `${schemaRoot}/fieldDefinitions/:contextOrigin/:contextId`,
    (routerOptions && routerOptions.middleware) || [],
    async (req, res) => {
      let allDefn = await getFieldDefinition(
        options.baseDefinition,
        req.params.contextOrigin,
        req.params.contextId
      );
      res.send(allDefn);
    }
  );

  /* Store fieldDefinition base on a base definition and a parent context*/
  router.put(
    `${schemaRoot}/fieldDefinitions/:contextOrigin/:contextId`,
    (routerOptions && routerOptions.middleware) || [],
    async (req, res) => {
      let allDefn = await saveFieldDefinition(
        options.baseDefinition,
        req.params.contextOrigin,
        req.params.contextId,
        req.body
      );
      res.send(allDefn);
    }
  );
};
