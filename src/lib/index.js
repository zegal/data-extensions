const mongoose = require("mongoose");

const { schemas, models } = require("../commons/database/app");

const { addSchema } = require("../api/http/routes/router");

const METAMODELS = [];

for (let key in schemas) {
  METAMODELS.push(key);
}

/*
    extend a schema with metamodels
*/
function extend({
  name,
  schema,
  metamodels = METAMODELS,
  inlineWithObject = false,
}) {
  if (!name || !schema || !metamodels || metamodels.length == 0)
    throw new Error("name, schema, metamodels are required");
  addSchema(name);
  metamodels.forEach((item) => {
    let collectionName = models[item].collection.collectionName;

    if (inlineWithObject) {
      const field = { [collectionName]: { type: mongoose.Schema.Types.Mixed } };
      schema.add(field);
    } else {
      const field = { [item]: { type: mongoose.Schema.Types.Mixed } };
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
  schema.virtual("inlineWithObject").get(function () {
    return inlineWithObject;
  });
  schema.virtual("metamodels").get(function () {
    return metamodels;
  });
  return schema;
}

/*
    right before a "find", prePopulateQuery:
        this will add "populate" to the base query so it looks like this
        populate("_dataSchema", "dataSchema")

    after a find, we will get data that looks like this
        {
            _dataSchema: {data: {[myData]}}
        }
    normalizeResult will change to:
        {
            dataSchema: {[myData]}
        }
*/
function prePopulateQuery(query) {
  let newModel = new query.model({});
  for (let i = 0; i < newModel.metamodels.length; i++) {
    let item = newModel.metamodels[i];

    let collectionName = models[item].collection.collectionName;

    query.populate("_" + collectionName, item);
  }
}

function normalizeResult(query, result) {
  let newModel = new query.model({});
  result.forEach((row) => {
    newModel.metamodels.forEach((item) => {
      let collectionName = models[item].collection.collectionName;

      let metadata = row["_" + collectionName];

      if (metadata) {
        row[collectionName] = metadata[item];
      }
      delete row["_" + collectionName];
    });
  });
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
  let { metamodels, inlineWithObject } = query ? modelFromQuery(query) : schema;

  let schemaName =
    (schema && schema.schemaName) ||
    (query && query.model && query.model.modelName);
  let object = objectFromQuery(query) || schema;

  stateObject["idArray"] = await idArrayFromQuery(query);
  metamodels.forEach((item) => {
    if (!inlineWithObject) {
      // if not inline, store this somewhere so it doesn't get touched....
      if (object[item]) {
        let data = {
          [item]: object[item],
          origin: schemaName,
        };

        if (object._id) data.refId = object._id;
        stateObject["_" + item] = data;

        object[item] = undefined;
        delete object[item];
      }
    }
  });
}

async function saveMeta(stateObject, { schema, query }) {
  let { metamodels, inlineWithObject } = query ? modelFromQuery(query) : schema;
  for (let i = 0; i < metamodels.length; i++) {
    let item = metamodels[i];
    if (!inlineWithObject) {
      const meta = stateObject["_" + item];
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

function addSchemaHooks(schema) {
  async function preUpdate() {
    await archiveMeta(this, { query: this, schema });
  }

  async function postUpdate() {
    await saveMeta(this, { query: this, schema });
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

  schema.pre("find", async function preFind() {
    prePopulateQuery(this);
  });

  schema.post("find", async function postFind(result) {
    normalizeResult(this, result);
  });

  schema.pre("findOne", async function preFindOne() {
    prePopulateQuery(this);
  });

  schema.post("findOne", async function postFindOne(result) {
    normalizeResult(this, [result]);
  });
}

module.exports = {
  extend,
};
