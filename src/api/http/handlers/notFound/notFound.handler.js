const { errorResponse } = require("../../../../commons/response/response");
const messages = require("../../../../config/messages");

const notFound = (req, res) => {
  const message = "notFound";
  const error = messages.error[message] || message;
  errorResponse(res, error, { status: 404 });
};

const handler = {
  notFound: notFound,
};

module.exports = handler;
