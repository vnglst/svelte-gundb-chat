const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const Gun = require("gun");

const server = new Hapi.Server({
  port: 8765,
  host: "localhost",
});

async function runtime() {
  new Gun({
    web: server.listener,
  });

  await server.register(Inert);

  server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: require("path").join(__dirname, "public"),
        redirectToSlash: true,
        index: true,
      },
    },
  });

  await server.start();
  console.log("Server running at:", server.info.uri);
}

runtime();
