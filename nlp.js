import { NlpManager, Language } from "node-nlp";
import { stringSimilarity } from "string-similarity-js";
import Utils from "./utils.js";

const config = await Utils.getConfig();

let registeredIntents = [];

const manager = new NlpManager({
  languages: config.language.available,
  forceNER: true,
  nlu: { log: false },
});
const languageSystem = new Language();

const registerIntents = async (intents) => {
  for (const intent of intents) {
    const { name, samples, language } = intent;
    samples.forEach((sample) => manager.addDocument(language, sample, name));
    registeredIntents.push(intent);
    Utils.logDebug(
      `Intent ${name} (${language}) has been registered. (${samples.length} samples)`
    );
  }
};

const train = async () => {
  await manager.train();
  manager.save();
};

const guessLanguage = async (text) => {
  const result = await languageSystem.guess(text);
  if (result && result[0]) return result[0].alpha2;
  return config.language.default;
};

const getDefaultResponse = async (language) => {
  return {
    intent: null,
    message: config.response.default.messages[language],
    trigger: config.response.default.actions,
  };
};

const processMessage = async (message, options = {}) => {
  let { language, restrict } = options;

  if (
    !message ||
    message.length < config.request.minLength ||
    message.length > config.request.maxLength
  )
    return null;

  if (!language) language = await guessLanguage(message);
  if (!config.language.available.includes(language)) {
    if (config.language.fallbacks[language])
      language = config.language.fallbacks[language];
    else language = config.language.default;
  }

  const response = await manager.process(language, message);
  if (
    response.intent == "None" ||
    response.score < config.response.requiredScore
  )
    return getDefaultResponse(language);
  const intentData = registeredIntents.find(
    (intent) =>
      intent.name === response.intent &&
      intent.language === language &&
      (!restrict || !restrict.length || intent.groups.includes(restrict))
  );
  if (!intentData) return getDefaultResponse(language);
  if (
    !intentData.samples.some(
      (sample) =>
        stringSimilarity(message, sample) > config.request.expectedSimilarity
    )
  ) {
    return getDefaultResponse(language);
  }

  const responseMessage = await intentData.generateResponse(
    response.intent,
    response
  );
  return {
    intent: response.intent,
    message: responseMessage,
    trigger: intentData.triggerActions,
  };
};

export default { registerIntents, train, processMessage };
