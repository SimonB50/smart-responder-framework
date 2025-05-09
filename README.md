# Smart Responder Framework
Smart Responder Framework (SRF) is a framework for building smart responders for support agents or other types of chatbots. It's powered by **Natural Language Processing** which allows it to understand the messages and properly respond to them while not being resource-intensive compared to using Machine Learning models.

## Features
- **Intent Detection**: Detects the intent of the message.
- **Custom Actions**: Allows you to define custom actions for each intent.
- **Language Detection**: Detects the language of the message.
- **Connectors**: Connects external services to power the responses.
  
## Installation
1. Clone the repository.
2. Install the dependencies using `npm i`.
3. Rename `config.example.json` to `config.json` and set the configuration.
4. Run the server using `npm start`.

## Usage
This framework currently supports following usage scenarios:
- **REST API**: You can send a POST request to the `/message` endpoint with the `message` in the body to get the response.
- **Connectors**: You can connect external services to power the responses.
- **CLI** (Development): You can use the CLI to test the responses and check detailed debug information.
- (Comming soon) **Web UI**: You can use the Web UI to test and manage the intents.

### REST API
You can send a POST request to the `/api/message` endpoint to get the response.

#### Request
```json
{
  "message": "Hello",
  "language": "en" // Optional
}
```

#### Response
```json
{
  "intent": "example_intent",
  "message": "Response message",
  "trigger": ["example_trigger"]
}
```

### Connectors
You can connect external services to power the responses. You can define the custom connectors in the `connectors` directory.

#### Currently supported connectors:
- **Discord**: Connects to Discord to power the responses.

#### Discord Connector
You can connect the Discord connector by properly setting the configuration in the `config.json` file.

```json
{
  "connectors": {
    "discord": {
      "enabled": true,
      "token": "BOT-TOKEN",
      "prefix": "<@mention>",
      "autoResponse": {
        "enabled": true,
        "ignoreInvalid": true,
        "channels": ["123456789012345678"]
      }
    }
  }
}
```

This will allow you to get the responses in the Discord chat. By default, the bot will respond to the messages that start with the `@mention`.

##### Auto Response
You can enable the auto response feature by setting the `enabled` property in `autoResponse` to `true`. This will allow the bot to respond to the messages that are sent in the channels defined in the `channels` array. If you want the bot to respond only to valid intents, you can set the `ignoreInvalid` property to `true`. This will make the bot respond only to the messages that are detected as intents.

### CLI
You can turn on the CLI by adding `--dev-mode` parameter while starting the server.
Note that this will **disable** all of the connectors.

## Creating a Smart Responder
You can create a smart responder by defining the intents `intents` directory.
This directory has specific structure:
- Each intent has its own file
- All of the intents needs to be placed into `[language]` directory (e.g. `en` for English). You cannot place one intent file in multiple languages.
- You can your intent files info `(group)` folders to group them. You can nest these folders as much as you want.

### Static intents
Static intent is a type of intent that only returns a predefined response.
Supported file types are `.json`, `.yaml` and `.yml`
Each static intent should define the following properties:
  - `samples`: Array of sample messages for detecting the intent.
  - `response`: Message that should be returned when the intent is detected.
  - `triggerActions`: Array of triggers that should be executed when the intent is detected.

### Dynamic intents
Dynamic intent base on executing a function to generate the response.
You can only use `.js` files for dynamic intents.
Each dynamic intent should define the following properties:
  - `samples`: Array of sample messages for detecting the intent.
  - `generateResponse()`: Function that will be called when the intent is detected. This function needs to return a string with the response.
  - `triggerActions`: Array of triggers that should be executed when the intent is detected.

Example intent files can be found in the `intents` directory.

### Writing proper samples
When writing the samples, use full sentences and proper grammar with decent length. This is to ensure no false positives are detected. The more samples you provide, the better the intent detection will be. You should add at least 5 samples for each intent.

### Understanding the triggers
Triggers are actions that should be executed when the intent is detected. The trigger is only a string that is used to identify the action.
Implementing the triggers is up to you or the connector you are using.

## License
This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for more information.