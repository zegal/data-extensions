/**
 *
 * @param {object} res response object
 * @param {string} message error message
 * @param {object} options other options
 */

const error = (res, message = "", options = {}) => {
  const status = +options.status || 400;
  res.status(status).json({ error: message });
};

module.exports = error;
