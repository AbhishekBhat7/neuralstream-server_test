const UAParser = require("ua-parser-js");

const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);

  return {
    device_name:
      parser.getDevice().model || "Unknown Device",

    platform:
      parser.getOS().name || "Unknown OS",

    browser:
      parser.getBrowser().name || "Unknown Browser",

    ip_address: req.ip,
  };
};

module.exports = {
  getDeviceInfo,
};