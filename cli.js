import { input } from "@inquirer/prompts";
import NLP from "./nlp.js";
import chalk from "chalk";
import Utils from "./utils.js";
import { stringSimilarity } from "string-similarity-js";

const config = await Utils.getConfig();

const start = async () => {
  while (true) {
    const message = await input({
      type: "input",
      name: "message",
      message: "Enter your message:",
    });
    const response = await NLP.processMessage(message, {
      debug: config?.debug,
    });
    if (!response || !response.intent) {
      console.log(
        `${chalk.red.bold(">>")} ${chalk.gray(
          "No intent for found for this message. It may not meet minimum message requirements."
        )}`
      );
      continue;
    }
    if (config?.debug) {
      console.log(
        `${chalk.yellow.bold(">>")} ${chalk.bold("Intent:")} ${chalk.gray(
          response.intent.name
        )} (${chalk.italic.underline(response.intent.source)})`
      );
      console.log(
        `${chalk.yellow.bold(">>")} ${chalk.bold("Language:")} ${chalk.gray(
          response.process.language
        )}`
      );
      console.log(
        `${chalk.yellow.bold(">>")} ${chalk.bold("Score:")} ${chalk.gray(
          response.process.score
        )}`
      );
      const bestMatch = response.intent.samples.sort(
        (a, b) =>
          stringSimilarity(response.process.utterance, b) -
          stringSimilarity(response.process.utterance, a)
      )[0];
      console.log(
        `${chalk.yellow.bold(">>")} ${chalk.bold("Sample:")} ${chalk.gray(
          bestMatch
        )} ${chalk.italic(
          `${(
            stringSimilarity(response.process.utterance, bestMatch) * 100
          ).toFixed(2)}%`
        )}`
      );
    }
    console.log(
      `${chalk.blue.bold(">>")} ${chalk.bold("Response:")} ${chalk.gray(
        response.message
      )}`
    );
    if (response && response.trigger.length) {
      console.log(
        `${chalk.green.bold(">>")} Triggered actions: ${response.trigger
          .map((action) => chalk.bold(action))
          .join(", ")}`
      );
    }
  }
};

export default { start };
