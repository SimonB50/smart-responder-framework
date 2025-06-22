import Utils from "./utils.js";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyFavicon from "fastify-favicon";
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
  root: path.join(__dirname, config.server.web.staticPath),
  prefix: "/",
  constraints: {},
});

fastify.register(fastifyFavicon);

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

fastify.post("/api/message", async (request, reply) => {
  const { message, language, restrict } = request.body;
  const response = await NLP.processMessage(message, {
    language,
    restrict,
  });
  reply.status(200).send(response);
});

fastify.setNotFoundHandler(async (request, reply) => {
  return reply.redirect("/");
});

// MIDDLEWARE
const validateAuth = async (req, reply) => {
  if (!config.server.auth.enabled) return true;
  const { headers } = req.raw;
  if (
    !headers.authorization ||
    !headers.authorization.startsWith("Bearer ") ||
    headers.authorization.split(" ")[1] !== config.server.auth.token
  )
    return false;
  return true;
};
fastify.addHook("onRequest", async (req, reply) => {
  const { url } = req.raw;
  const isAuthenticated = await validateAuth(req, reply);
  if (!isAuthenticated && url.startsWith("/api"))
    return reply.status(401).send({ error: "Unauthorized" });
});

if (config.server.web.enabled) await Web.setup(fastify);

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
