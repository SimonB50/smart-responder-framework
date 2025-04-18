import Utils from "./utils.js";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import NLP from "./nlp.js";
import chalk from "chalk";
import Web from "./web.js";

const config = await Utils.getConfig();

const fastify = Fastify({
  logger: false,
});

let __dirname = Utils.getDirname(import.meta.url);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  constraints: {},
});

fastify.post("/api/message", async (request, reply) => {
  const { message, language, restrict } = request.body;
  const response = await NLP.processMessage(message, {
    language,
    restrict,
  });
  reply.status(200).send(response);
});

if (process.argv.includes("--dev-mode")) await Web.setup(fastify);

const start = async () => {
  try {
    await fastify.listen({
      host: config.server.host,
      port: config.server.port,
    });
    Utils.logInfo(
      `Server listening on ${chalk.underline(
        `${config.server.host}:${config.server.port}`
      )}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

export default { start };
