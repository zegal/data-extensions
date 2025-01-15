const EmployeeSchema = require("../src/db/models/test/employee");

// used by test.js only
module.exports = {
  name: "employee",
  schema: EmployeeSchema,
  metamodels: ["tags", "data"],
  options: {
    inlineWithObject: false,
    data: {
      schemaName: "metadata",
      baseDefinition: "contract-meta",
      derivedDefinition: {
        origin: "employer",
        refId: "employerId",
      },
    },
  },
};
