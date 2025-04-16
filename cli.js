import { input } from "@inquirer/prompts";
import NLP from "./nlp.js";
import chalk from "chalk";

const start = async () => {
  while (true) {
    const message = await input({
      type: "input",
      name: "message",
      message: "Enter your message:",
    });
    const response = await NLP.processMessage(message);
    console.log(
      `${chalk.blue.bold(">>")} ${chalk.gray(
        response?.message
          ? response.message
          : "Your message does not meet the requirements."
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
