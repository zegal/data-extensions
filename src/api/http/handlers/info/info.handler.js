const getAppInfo = (req, res) => {
  res.json({ app: "auth-gateway", version: "1.0.0" });
};

const infoHandler = {
  getAppInfo: getAppInfo, // For GET request
};

module.exports = infoHandler;
