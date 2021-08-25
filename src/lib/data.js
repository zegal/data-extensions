const { models } = require("../commons/database/app");
const { flatten } = require("flattenjs");

async function decorateMultiple(objects, { data }, contextOrigin, contextId) {
  let contextIdMap = {};
  if (!contextOrigin) {
    console.log("no contextOrigin", data);
    contextOrigin = data.derivedDefinition.origin;
    // collect all contextIds....
    objects.forEach((item) => {
      contextIdMap[item[data.derivedDefinition.refId]] = {};
    });
  } else {
    contextIdMap[contextId] = {};
  }

  let contextIdArray = [];
  for (let key in contextIdMap) {
    contextIdArray.push(key);
  }

  const { base } = await getFieldDefinition(data.baseDefinition);
  await Promise.all(
    contextIdArray.map(async (item) => {
      const { custom } = await getFieldDefinition(
        data.baseDefinition,
        contextOrigin,
        item
      );
      contextIdMap[item] = custom;
    })
  );
  console.log("contextIdMap", contextIdMap);

  if (base && base.fields) {
    objects.forEach((item) => {
      const allFields = base.fields.concat(
        (contextIdMap[item[data.derivedDefinition.refId]] &&
          contextIdMap[item[data.derivedDefinition.refId]].fields) ||
          []
      );
      let metadata = item[data.schemaName] || item.data;
      metadata.flattened = flattenData(
        item[data.schemaName || "data"],
        allFields
      );
      console.log("item", item);
    });
  }
  return objects;
}

async function decorate(object, { data }, contextOrigin, contextId) {
  return (
    await decorateMultiple([object], { data }, contextOrigin, contextId)
  )[0];
}

async function clean(object, { data }) {
  delete object[data.schemaName || "data"].flattened;
  object[data.schemaName || "data"].flattened = null;
  return;
}

function flattenData(data, fields) {
  let flattenedData = [];
  let flattened = flatten(data);
  fields.forEach((fd) => {
    let value = flattened[fd.id];
    flattenedData.push({
      label: fd.name || fd.question,
      value: value,
      id: fd.id,
    });
  });
  return flattenedData;
}

async function getFieldDefinition(baseDefinition, contextOrigin, contextId) {
  const code = `${contextOrigin}-${contextId}`;
  let [base, custom] = await Promise.all([
    models["fieldDefinitions"].findOne({ code: baseDefinition }),
    contextOrigin &&
      contextId &&
      models["fieldDefinitions"].findOne({ code: code }),
  ]);

  if (!custom) {
    custom = await models["fieldDefinitions"].create({
      name: code,
      code: code,
      inheritedFromCode: base && base.code,
      fields: [],
    });
  }

  return {
    base,
    custom,
  };
}

async function saveFieldDefinition(
  baseDefinition,
  contextOrigin,
  contextId,
  data
) {
  let { base, custom } = await getFieldDefinition(
    baseDefinition,
    contextOrigin,
    contextId
  );

  console.log("updating...", data);
  custom = await models["fieldDefinitions"].findOneAndUpdate(
    { _id: custom._id },
    { fields: data.fields, name: data.name },
    { new: true }
  );
  return {
    base,
    custom,
  };
}

module.exports = {
  flattenData,
  getFieldDefinition,
  saveFieldDefinition,
  decorateMultiple,
  decorate,
  clean,
};
