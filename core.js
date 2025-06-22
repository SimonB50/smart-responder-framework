import chalk from "chalk";

import Intents from "./intents.js";
import Utils from "./utils.js";
import NLP from "./nlp.js";
import Server from "./server.js";
import Connectors from "./connectors.js";
import CLI from "./cli.js";

const load = async (flush = true) => {
  const intents = await Intents.getIntents();
  Utils.logInfo(`Loaded ${chalk.bold(intents.length)} responder intents.`);
  if (flush) await NLP.flushIntents();
  await NLP.registerIntents(intents);
  await NLP.train();
  Utils.logInfo(
    `${chalk.bold("Smart Responder")} has been prepared and trained.`
  );
};

const handleStart = async () => {
  await Server.start(); // Web server
  if (!process.argv.includes("--dev-mode")) await Connectors.start(); // Connectors (only in production mode)
  if (process.argv.includes("--dev-mode")) await CLI.start(); // CLI (only in development mode)
};

export default { load, handleStart };
