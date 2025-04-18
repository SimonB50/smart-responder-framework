import fs from "fs/promises";
import path from "path";
import Utils from "./utils.js";
import chalk from "chalk";
import yaml from "yaml";

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
      if (
        intent.startsWith("_") ||
        ![".json", ".yaml", ".yml", ".js"].some((x) => intent.endsWith(x))
      )
        continue;
      const intentFile = path.join(directory, intent);
      let intentData;
      switch (true) {
        case intent.endsWith(".json"):
        case intent.endsWith(".yaml"):
        case intent.endsWith(".yml"):
          intentData = await processStaticIntent(intent, intentFile);
          break;
        case intent.endsWith(".js"):
          intentData = await processDynamicIntent(intent, intentFile);
          break;
        default:
          continue;
      }
      if (!intentData) continue;
      intents.push(intentData);
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

const processStaticIntent = async (intent, file) => {
  const intentContent = await fs.readFile(file, "utf-8");
  let intentData = null;
  switch (true) {
    case file.endsWith(".json"):
      intentData = JSON.parse(intentContent);
      break;
    case file.endsWith(".yaml"):
    case file.endsWith(".yml"):
      intentData = yaml.parse(intentContent);
      break;
  }
  if (
    !intentData ||
    typeof intentData !== "object" ||
    !["samples", "response", "triggerActions"].every((key) => key in intentData)
  ) {
    Utils.logError(
      `Intent ${chalk.bold(
        intent
      )} is missing one of the required keys: ${chalk.bold(
        "samples, response, triggerActions"
      )}.`,
      `\n> Path: ${file}`
    );
    return null;
  }
  let intentObject = {
    name: intent.replace(/\.json|\.yaml|\.yml/g, ""),
    samples: intentData.samples,
    generateResponse: () => {
      return intentData.response;
    },
    triggerActions: intentData.triggerActions,
    source: file,
  };
  return intentObject;
};

const processDynamicIntent = async (intent, file) => {
  const intentData = await import(`file://${file}`);
  if (
    !intentData.default ||
    typeof intentData.default !== "object" ||
    !["samples", "generateResponse", "triggerActions"].every(
      (key) => key in intentData.default
    )
  ) {
    Utils.logError(
      `Intent ${chalk.bold(
        intent
      )} is missing one of the required keys: ${chalk.bold(
        "samples, generateResponse, triggerActions"
      )}.`,
      `\n> Path: ${file}`
    );
    return null;
  }
  let intentObject = {
    name: intent.replace(/\.js/g, ""),
    samples: intentData.default.samples,
    generateResonse: intentData.default.generateResponse,
    triggerActions: intentData.default.triggerActions,
    source: file,
  };
  return intentObject;
};

export default { getIntents };
