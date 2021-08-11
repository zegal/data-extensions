/**
 * A common file for saving all the messages from API
 */

const messages = {
  error: {
    notFound: "Sorry! the resource is not found in the server",
    methodNotAllowed: (method) =>
      `Sorry! the method ${method} is not allowed in this resource`,
  },
};

module.exports = messages;
