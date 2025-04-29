import fs from "fs/promises";
import path from "path";
import yaml from "yaml";
import chalk from "chalk";
import translate from "translate";

import Utils from "./utils.js";
const config = await Utils.getConfig();

const translationEngine = config.translation.engine.toLowerCase();
if (!["google", "deepl", "libre", "yandex"].includes(translationEngine))
  throw Utils.logError(`Engine ${translationEngine} is not supported.`);
translate.engine = translationEngine;
if (translationEngine !== "google") {
  if (!config.translation.apiKey)
    throw Utils.logError(
      `API key is required for ${translationEngine} translation engine.`
    );
  translate.key = config.translation.apiKey;
}
if (translationEngine == "libre" && config.translation.apiUrl)
  translate.url = config.translation.apiUrl;
const targets = config.translation.targetLanguages;

const analyze = async (dir) => {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      await analyze(path.join(dir, file.name));
    } else {
      const filePath = path.join(dir, file.name);
      const fileLanguages = filePath.match(/\[(..)\]/g);
      if (fileLanguages.length > 1) {
        Utils.logError(
          `File ${filePath} has more than one language. Please remove the extra languages.`
        );
        continue;
      }
      const finalLang = fileLanguages[0].replace(/\[|\]/g, "");
      switch (true) {
        case filePath.endsWith(".json"):
        case filePath.endsWith(".yaml"):
        case filePath.endsWith(".yml"):
          await translateStatic(filePath, finalLang);
          break;
        case filePath.endsWith(".js"):
          await translateDynamic(filePath, finalLang);
          break;
      }
    }
  }
};

const handlePath = async (filePath) => {
  const fileDir = path.dirname(filePath);
  const exists = await Utils.exists(fileDir);
  if (!exists) {
    await fs.mkdir(fileDir, { recursive: true }).catch((err) => null);
  }
};

const translateStatic = async (file, lang) => {
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
  for (const language of targets) {
    if (language === lang) continue;
    const newPath = file.replace(/\[(..)\]/g, `[${language}]`);
    const exists = await Utils.exists(newPath);
    if (exists) continue;
    const newIntent = {
      samples: [],
      triggerActions: intentData.triggerActions,
      response: "",
    };
    for (const sampleText of intentData.samples) {
      const translatedSample = await translate(sampleText, {
        to: language,
      });
      newIntent.samples.push(translatedSample);
    }
    const translatedResponse = await translate(intentData.response, {
      to: language,
    });
    newIntent.response = translatedResponse;
    await handlePath(file.replace(/\[(..)\]/g, `[${language}]`));
    await fs.writeFile(
      file.replace(/\[(..)\]/g, `[${language}]`),
      newPath.endsWith(".json")
        ? JSON.stringify(newIntent, null, 2)
        : yaml.stringify(newIntent)
    );
    Utils.logInfo(
      `Translated ${chalk.bold(path.basename(file))} to ${chalk.bold(
        language
      )} and saved to ${chalk.underline(newPath)}`
    );
  }
};
const translateDynamic = async (file, lang) => {
  return Utils.logError(
    `File ${chalk.bold(
      path.basename(file)
    )} will not be translated since dynamic intents are not supported yet.`
  );
};

analyze(path.join(Utils.getDirname(import.meta.url), "intents"));
