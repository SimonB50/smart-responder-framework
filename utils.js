import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import chalk from "chalk";

// FILE SYSTEM UTILS

const getDirname = (importMetaUrl) => {
  return dirname(fileURLToPath(importMetaUrl));
};

const isFolder = async (path) => {
  const stats = await fs.stat(path);
  return stats.isDirectory();
};

const exists = async (path) => {
  try {
    await fs.stat(path);
    return true;
  } catch (error) {
    return false;
  }
};

// CONFIG UTILS

let configCache = {};
const getConfig = async (configPath) => {
  if (!configPath)
    configPath = join(getDirname(import.meta.url), "config.json");
  if (configCache && configCache[configPath]) return configCache[configPath];
  const fileContent = await fs.readFile(configPath, "utf-8");
  const configContent = JSON.parse(fileContent);
  configCache[configPath] = configContent;
  return configContent;
};
const config = await getConfig();

// LOGGER UTILS

const logInfo = (...message) => {
  console.log(
    chalk.blue(`[INFO]`),
    chalk.gray(`[${new Date().toLocaleTimeString()}]`),
    ...message
  );
};

const logError = (...message) => {
  console.log(
    chalk.red(`[ERROR]`),
    chalk.gray(`[${new Date().toLocaleTimeString()}]`),
    ...message
  );
};

const logDebug = (...message) => {
  if (!config.debug) return;
  console.log(
    chalk.yellow(`[DEBUG]`),
    chalk.gray(`[${new Date().toLocaleTimeString()}]`),
    ...message
  );
};

// DATA UTILS
const appendData = async (source, extras) => {
  return {
    ...source,
    ...extras,
  }
}

export default {
  getConfig,
  getDirname,
  isFolder,
  exists,
  logInfo,
  logError,
  logDebug,
  appendData,
};
