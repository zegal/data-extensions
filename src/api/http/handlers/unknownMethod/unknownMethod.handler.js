const { errorResponse } = require("../../../../commons/response/response");
const messages = require("../../../../config/messages");

const methodNotAllowed = (req, res) => {
  const message = "methodNotAllowed";
  const error = messages.error[message](req.method) || message;
  errorResponse(res, error, { status: 405 });
};

const handler = {
  methodNotAllowed: methodNotAllowed,
};

module.exports = handler;
