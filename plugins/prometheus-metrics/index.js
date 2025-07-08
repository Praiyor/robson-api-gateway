const client = require("prom-client");

module.exports = {
  version: "1.0.0",
  policies: [],
  init: function (pluginContext) {
    const register = new client.Registry();
    client.collectDefaultMetrics({ register });

    const httpRequestCounter = new client.Counter({
      name: "http_requests_total",
      help: "Número de requisições HTTP",
      labelNames: ["method", "path", "status"],
    });

    pluginContext.registerGatewayRoute((app) => {
      app.use((req, res, next) => {
        res.on("finish", () => {
          httpRequestCounter.inc({
            method: req.method,
            path: req.path,
            status: res.statusCode,
          });
        });
        next();
      });

      app.get("/metrics", async (req, res) => {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
      });
    });
  },
};
