const mongoose = require("mongoose");

const { models } = require("../commons/database/app");

const { addSchema } = require("../api/http/routes/router");

/*
    extend a schema with metamodels
*/
function extendMetaData({ name, schema, metamodels, options }) {
  if (!name || !schema || !metamodels || !metamodels[0])
    throw new Error("name, schema, metamodels are required");

  addSchema(name, options);
  let { inlineWithObject } = options;
  metamodels.forEach((item) => {
    let collectionName = (options[item] && options[item].schemaName) || item;

    if (inlineWithObject) {
      const field = { [collectionName]: { type: mongoose.Schema.Types.Mixed } };
      schema.add(field);
    } else {
      const field = { [collectionName]: { type: mongoose.Schema.Types.Mixed } };
      schema.add(field);
      schema.virtual("_" + collectionName, {
        ref: item,
        localField: "_id",
        foreignField: "refId",
        justOne: true,
      });
    }
  });
  if (!inlineWithObject) {
    addSchemaHooks(schema);
  }
  schema.virtual("schemaName").get(function () {
    return name;
  });
  schema.virtual("options").get(function () {
    return options;
  });
  schema.virtual("metamodels").get(function () {
    return metamodels;
  });

  return schema;
}

async function normalizeFind(query, result) {
  let newModel = new query.model({});
  let { options, schemaName } = newModel;

  let idArray = [];

  const metasearchConditions = {};

  if (result && result[0]) {
    idArray = result.map((row) => row && row._id);
    for (let j = 0; j < newModel.metamodels.length; j++) {
      let item = newModel.metamodels[j];

      let collectionName = (options[item] && options[item].schemaName) || item;

      let model = models[item];

      let metasearch = query["_" + collectionName];

      if (metasearch && Object.keys(metasearch).length >= 1) {
        metasearchConditions[collectionName] = true;
      }

      let results = await model
        .find({
          origin: schemaName,
          refId: { $in: idArray },
          ...metasearch,
        })
        .lean();
      let resultMap = {};
      results.forEach((item) => (resultMap[item.refId] = item));

      result.forEach((row) => {
        if (resultMap[row._id]) {
          row[collectionName] = resultMap[row._id][item];
        }
      });

      try {
        const { decorateMultiple } = require(`./${item}`);
        result = await decorateMultiple(result, options);
      } catch (err) {
        //console.log("decorateMultiple for", item, err);
      }
    }

    // now loop through results and prune ones that don't match metasearchConditions
    for (let i = result.length - 1; i >= 0; i--) {
      let row = result[i];
      let toDelete = false;
      for (let key in metasearchConditions) {
        if (!row[key]) toDelete = true;
      }
      if (toDelete) {
        result.splice(i, 1);
      }
    }
  }
}

function modelFromQuery(query) {
  let model = new query.model({});
  return model;
}

function objectFromQuery(query) {
  if (query) {
    let updateObject = query.getUpdate();
    let setObject = updateObject["$set"];
    return Object.keys(setObject).length == 1 && setObject["updatedAt"]
      ? updateObject
      : setObject;
  }
}

async function idArrayFromQuery(query) {
  if (query) {
    let result = await query.model.find(query.getQuery());
    return result.map((item) => item._id);
  }
}

async function archiveMeta(stateObject, { schema, query }) {
  let { metamodels, options, schemaName } = query
    ? modelFromQuery(query)
    : schema;
  let { inlineWithObject } = options;

  let object = objectFromQuery(query) || schema;

  stateObject["idArray"] = await idArrayFromQuery(query);
  metamodels.forEach((item) => {
    let collectionName = (options[item] && options[item].schemaName) || item;
    if (!inlineWithObject) {
      // if not inline, store this somewhere so it doesn't get touched....
      if (object[collectionName]) {
        let data = {
          [item]: object[collectionName],
          origin: schemaName,
        };

        if (object._id) data.refId = object._id;
        stateObject["_" + item] = data;

        object[collectionName] = undefined;
        delete object[collectionName];
      }
    }
  });
}

async function saveMeta(stateObject, { schema, query }) {
  let { options, metamodels } = query ? modelFromQuery(query) : schema;
  let { inlineWithObject } = options;
  for (let i = 0; i < metamodels.length; i++) {
    let item = metamodels[i];
    if (!inlineWithObject) {
      let meta = stateObject["_" + item];
      if (meta) {
        const model = models[item];

        if (stateObject["idArray"]) {
          await model.updateMany(
            { origin: meta.origin, refId: { $in: stateObject["idArray"] } },
            { $set: meta },
            { upsert: true, new: true }
          );
        } else {
          await model.updateOne(
            { origin: meta.origin, refId: meta.refId },
            { $set: meta },
            { upsert: true, new: true }
          );
        }
      }
    }
  }
}

async function deleteMeta(stateObject, { schema, query }) {
  let { options, metamodels, schemaName } = query
    ? modelFromQuery(query)
    : schema;
  let { inlineWithObject } = options;

  for (let i = 0; i < metamodels.length; i++) {
    let item = metamodels[i];
    if (!inlineWithObject) {
      if (stateObject["idArray"]) {
        const model = models[item];
        await model.deleteMany({
          origin: schemaName,
          refId: { $in: stateObject["idArray"] },
        });
      }
    }
  }
}

function preprocessFind(_query) {
  let { options, metamodels } = modelFromQuery(_query);
  let query = _query.getQuery();
  for (let j = 0; j < metamodels.length; j++) {
    let item = metamodels[j];
    let collectionName = (options[item] && options[item].schemaName) || item;
    let metaquery = {};
    _query["_" + collectionName] = metaquery;
    for (let key in query) {
      if (key.indexOf(collectionName) >= 0) {
        let normalizedKey = key.replace(collectionName, item);
        _query["_" + collectionName][normalizedKey] = query[key];
        delete query[key];
      }
    }
  }
}

async function addToPipeline(aggregate) {
  let pipeline = aggregate.pipeline();
  let model = new aggregate._model();
  let { options, metamodels } = model;

  let metasearch = [];

  // first prune pipeline of metadata specific match constraints
  for (let i = pipeline.length - 1; i >= 0; i--) {
    let entry = pipeline[i];
    if (entry["$match"]) {
      // now we want to mess with the $match entries
      let match = entry["$match"];
      for (let j = 0; j < metamodels.length; j++) {
        let item = metamodels[j];
        let collectionName =
          (options[item] && options[item].schemaName) || item;
        for (let key in match) {
          if (key.indexOf(collectionName) >= 0) {
            let normalizedKey = key.replace(collectionName, item);
            metasearch.push({ [normalizedKey]: match[key] });
            delete match[key];
          }
        }
      }
      // if no keys in match, just delete the match entry
      if (Object.keys(match) == 0) {
        pipeline.splice(i, 1);
      }
    }
  }

  for (let j = 0; j < metamodels.length; j++) {
    let item = metamodels[j];
    let collectionName = (options[item] && options[item].schemaName) || item;

    pipeline.push({
      $lookup: {
        from: item,
        localField: "_id",
        foreignField: "refId",
        as: collectionName,
      },
    });
    pipeline.push({
      $unwind: { path: `$${collectionName}`, preserveNullAndEmptyArrays: true },
    });
    pipeline.push({
      $addFields: {
        [`${collectionName}`]: `$${collectionName}.${item}`,
      },
    });
  }

  // add back those constraints
  metasearch.forEach((item) => {
    pipeline.push({ $match: item });
  });
}

function addSchemaHooks(schema) {
  async function preDelete() {
    this["idArray"] = await idArrayFromQuery(this);
  }

  async function preUpdate() {
    await archiveMeta(this, { query: this, schema });
  }

  async function postUpdate() {
    await saveMeta(this, { query: this, schema });
  }

  async function postDelete() {
    await deleteMeta(this, { query: this, schema });
  }

  schema.pre("validate", async function preValidate() {
    await archiveMeta(this, { schema: this });
  });

  schema.pre("save", async function preSave() {
    await archiveMeta(this, { schema: this });
  });

  schema.post("save", async function postSave() {
    await saveMeta(this, { schema: this });
  });

  schema.pre("update", preUpdate);
  schema.post("update", postUpdate);
  schema.pre("updateOne", preUpdate);
  schema.post("updateOne", postUpdate);
  schema.pre("updateMany", preUpdate);
  schema.post("updateMany", postUpdate);

  schema.pre("deleteOne", preDelete);
  schema.post("deleteOne", postDelete);
  schema.pre("deleteMany", preDelete);
  schema.post("deleteMany", postDelete);

  schema.pre("findOneAndUpdate", preUpdate);
  schema.post("findOneAndUpdate", postUpdate);

  schema.pre("findOneAndDelete", preDelete);
  schema.post("findOneAndDelete", postDelete);

  schema.pre("findOneAndRemove", preDelete);
  schema.post("findOneAndRemove", postDelete);

  schema.pre("find", async function preFind() {
    await preprocessFind(this);
  });

  schema.post("find", async function postFind(result) {
    await normalizeFind(this, result);
  });
  schema.post("findOne", async function postFindOne(result) {
    await normalizeFind(this, [result]);
  });
  schema.pre("aggregate", async function preAggregate() {
    await addToPipeline(this);
  });
}

module.exports = extendMetaData;
