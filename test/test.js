require("dotenv").config();
const Mongoose = require("mongoose").Mongoose;
const { describe, expect, test } = require("@jest/globals");

const { init, extendMetaData } = require("../src");
const employeeMetadataExtensionOption = require("./employee-options");

const MONGO_URI = process.env.MONGO_DB_DEN;

describe("This test suit tests the init and extendMetaData", () => {
  test("Connect with mongodb with mongoose package", async () => {
    const mongoose = new Mongoose();
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);

    // wait and check for the mongoose connection to be ready
    expect(mongoose.connection.readyState).toBe(1);

    // add the models to the mongoose connection
    init(mongoose);
    // the above connection adds 4 models to the mongoose connection
    expect(Object.keys(mongoose.models).length).toBeGreaterThan(0);

    const EmployeeSchema = extendMetaData(employeeMetadataExtensionOption);
    mongoose.model("employee", EmployeeSchema);
    // check if the employee model is included in the mongoose model list
    expect(Object.keys(mongoose.models).includes("employee")).toBeTruthy();

    // closes mongoose connection
    await mongoose.connection.close();
    expect(mongoose.connection.readyState).toBe(0);
  });

  // just to test jest
  test("adds 1 + 2 to equal 3", () => {
    expect(((a, b) => a + b)(1, 2)).toBe(3);
  });
});
