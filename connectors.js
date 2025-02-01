import chalk from "chalk";
import Utils from "./utils.js";

const config = await Utils.getConfig();

const start = async () => {
  for (const connector of Object.keys(config.connectors)) {
    const connectorConfig = config.connectors[connector];
    if (!connectorConfig.enabled) continue;
    try {
      const connectorModule = await import(
        `./connectors/${connector}/index.js`
      );
      await connectorModule.default.start(connectorConfig);
    } catch (error) {
      Utils.logError(
        `Failed to start ${chalk.bold(connector)} connector! ${error}`
      );
    }
  }
};

export default { start };
