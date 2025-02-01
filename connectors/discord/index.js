import { Client, Events, IntentsBitField } from "discord.js";
import chalk from "chalk";
import Utils from "../../utils.js";
import NLP from "../../nlp.js";

const start = async (config) => {
  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  });

  try {
    await client.login(config.token);
  } catch (error) {
    Utils.logError(
      `Failed to start ${chalk.bold("Discord")} connector! ${error}`
    );
  }

  client.on(Events.ClientReady, () => {
    Utils.logInfo(
      `${chalk.bold(
        "Discord"
      )} connector is now ready and listening for messages.`
    );
  });
  client.on(Events.MessageCreate, async (message) => {
    const hasPrefix =
      config.prefix == "<@mention>"
        ? message.mentions.has(client.user)
        : message.content.startsWith(config.prefix);
    if (!hasPrefix) return;
    const response = await NLP.processMessage(message.content);
    message.reply(response.message);
  });
};

export default { start };
