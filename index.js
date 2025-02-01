import chalk from "chalk";

import Intents from "./intents.js";
import Utils from "./utils.js";
import NLP from "./nlp.js";
import Server from "./server.js";
import Connectors from "./connectors.js";
import CLI from "./cli.js";

const intents = await Intents.getIntents();
Utils.logInfo(`Loaded ${chalk.bold(intents.length)} responder intents.`);

await NLP.registerIntents(intents);
await NLP.train();
Utils.logInfo(
  `${chalk.bold("Smart Responder")} has been prepared and trained.`
);

await Server.start();
if (!process.argv.includes("--dev-mode")) await Connectors.start();

if (process.argv.includes("--dev-mode")) await CLI.start();
