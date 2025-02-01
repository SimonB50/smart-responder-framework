import fs from "fs/promises";
import path from "path";
import Utils from "./utils.js";
import chalk from "chalk";

const config = await Utils.getConfig();

const __dirname = Utils.getDirname(import.meta.url);

const getIntents = async (directory) => {
  if (!directory) directory = path.join(__dirname, "intents");
  const intents = await processIntents(directory);

  let finalIntents = [];
  for (const intent of intents) {
    if (!intent.language) intent.language = config.language.default;
    finalIntents.push(intent);
    Utils.logDebug(
      `Loaded intent ${chalk.bold(intent.name)} (${intent.language})`
    );
  }

  return finalIntents;
};

const processIntents = async (directory) => {
  if (!directory) directory = path.join(__dirname, "intents");
  let intents = [];
  const intentsDir = await fs.readdir(directory);
  for (const intent of intentsDir) {
    if (await Utils.isFolder(path.join(directory, intent))) {
      if (intent.match(/(?<=\().*?(?=\))/)) {
        const group = intent.match(/(?<=\().*?(?=\))/)[0];
        const groupDir = path.join(directory, intent);
        const groupIntents = await processGroup(group, groupDir);
        intents.push(...groupIntents);
        continue;
      }
      if (intent.match(/(?<=\[).*?(?=\])/)) {
        const language = intent.match(/(?<=\[).*?(?=\])/)[0];
        const languageDir = path.join(directory, intent);
        const languageIntents = await processLanguage(language, languageDir);
        intents.push(...languageIntents);
        continue;
      }
      Utils.logError(
        `${chalk.bold(
          intent
        )} is not a valid intent folder format! Please use ${chalk.bold(
          "(group)"
        )} or ${chalk.bold("[lang]")}.`,
        `\n> Path: ${path.join(directory, intent)}`
      );
    } else {
      const intentFile = path.join(directory, intent);
      const intentData = await processIntent(intent, intentFile);
      if (intentData) intents.push(intentData);
    }
  }
  return intents;
};

const processGroup = async (group, directory) => {
  const groupIntents = await processIntents(directory);
  for (const groupIntent of groupIntents) {
    groupIntent.name = `${group}.${groupIntent.name}`;
    groupIntent.groups instanceof Array
      ? groupIntent.groups.push(group)
      : (groupIntent.groups = [group]);
  }
  return groupIntents;
};

const processLanguage = async (language, directory) => {
  const languageIntents = await processIntents(directory);
  for (const languageIntent of languageIntents) {
    if (languageIntent.languages) {
      Utils.logError(
        `Intent ${chalk.bold(
          languageIntent.name
        )} is trying to load in multiple languages! Skipping...`,
        `\n> Path: ${languageIntent.source}`
      );
      continue;
    }
    languageIntent.language = language;
  }
  return languageIntents;
};

const processIntent = async (intent, file) => {
  const intentData = await import(`file://${file}`);
  if (
    !intentData.default ||
    typeof intentData.default !== "object" ||
    !["samples", "triggerActions", "generateResponse"].every(
      (key) => key in intentData.default
    )
  ) {
    Utils.logError(
      `Intent ${chalk.bold(
        intent
      )} is missing one of the required keys: ${chalk.bold(
        "samples, triggerActions, generateResponse"
      )}.`,
      `\n> Path: ${file}`
    );
    return null;
  }
  let intentObject = {
    name: intent.replace(/\.js/g, ""),
    ...intentData.default,
    source: file,
  };
  return intentObject;
};

export default { getIntents };
