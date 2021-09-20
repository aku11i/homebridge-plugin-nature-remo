if (process.env.NODE_ENV === "development") {
  require("ts-node").register({
    transpileOnly: true,
  });

  module.exports = require("./src");
} else {
  module.exports = require("./dist");
}
