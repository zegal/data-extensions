const { models } = require("../commons/database/app");
const { flatten } = require("flattenjs");

async function decorateMultiple(objects, { metadata }, contextOrigin, contextId) {
  let contextIdMap = {};
  if (!contextOrigin) {
    contextOrigin = metadata.derivedDefinition.origin;
    // collect all contextIds....
    objects.forEach((item) => {
      contextIdMap[item[metadata.derivedDefinition.refId]] = {};
    });
  } else {
    contextIdMap[contextId] = {};
  }

  let contextIdArray = [];
  for (let key in contextIdMap) {
    contextIdArray.push(key);
  }

  const { base } = await getFieldDefinition(metadata.baseDefinition);
  await Promise.all(
    contextIdArray.map(async (item) => {
      const { custom } = await getFieldDefinition(
        metadata.baseDefinition,
        contextOrigin,
        item
      );
      contextIdMap[item] = custom;
    })
  );

  if (base && base.fields) {
    objects.forEach((item) => {
      const allFields = base.fields.concat(
        (contextIdMap[item[metadata.derivedDefinition.refId]] &&
          contextIdMap[item[metadata.derivedDefinition.refId]].fields) ||
          (contextIdMap[contextId] && contextIdMap[contextId].fields) ||
          []
      );

      // let metadata = item[data.schemaName] || item.data;
      // metadata.flattened = flattenData(
      //   item[data.schemaName] || item["data"],
      //   allFields
      // );
    });
  }
  return objects;
}

async function decorate(object, { metadata }, contextOrigin, contextId) {
  return (
    await decorateMultiple([object], { metadata }, contextOrigin, contextId)
  )[0];
}

function flattenData(data, fields) {
  let flattenedData = [];
  let flattened = flatten(data);
  fields.forEach((fd) => {
    let value = flattened[fd.id];
    delete flattened[fd.id];
    flattenedData.push({
      label: fd.name || fd.question,
      value: value,
      id: fd.id,
    });
  });

  // now for the leftovers.....
  for (const key in flattened) {
    flattenedData.push({
      label: key,
      value: flattened[key],
      id: key,
    });
  }
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

  if (!custom && contextOrigin && contextId) {
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
};
