const {loadModels} = require("../src/commons/database/app");

const {extend} = require("../src/lib");


/* loadModels and setup the router */
const init = async function(database, router) {
    await loadModels(database);
}

module.exports = {
    init,
    extend
}
