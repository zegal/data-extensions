const Boom = require("@hapi/boom");

// build error type
const isError = function (err) {
  return (
    err &&
    err.stack &&
    err.message &&
    typeof err.stack === "string" &&
    typeof err.message === "string"
  );
};
const buildErrorType = function (err) {
  if (isError(err)) return err;
  err = typeof err === "string" ? err : JSON.stringify(err);
  return new Error(err);
};
const buildError = (err, statusCode = 401) => {
  err = buildErrorType(err);
  return err.isBoom ? err : Boom.boomify(err, { statusCode });
};
module.exports = { buildError };
