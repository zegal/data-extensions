const { models } = require("../../../commons/database/app");

async function getFieldDefinition(baseDefinition, contextOrigin, contextId) {
  let base = await models["fieldDefinitions"].findOne({ code: baseDefinition });

  console.log("got baseDefinition", base);

  let derived = await models["fieldDefinitions"].findOne({
    code: `${contextOrigin}-${contextId}`,
  });
  console.log("got derivedDefinition", derived);

  return {
    base,
    derived,
  };
}

module.exports = (router, schemaRoot, options) => {
  router.get(
    `${schemaRoot}/:id/fieldDefinitions/:contextOrigin/:contextId`,
    async (req, res) => {
      let allDefn = await getFieldDefinition(
        options.baseDefinition,
        req.params.contextOrigin,
        req.params.contextId
      );
      res.send(allDefn);
    }
  );
};
