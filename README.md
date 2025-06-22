<p align="center">
  <img src="./assets/logo.png" alt="Librusek Logo" width="100"/>
</p>

<h1 align="center">Smart Responder Framework (SRF)</h1>

**Smart Responder Framework (SRF)** is a lightweight, efficient framework for building intelligent chat responders, ideal for support agents or chatbot applications. Powered by **Natural Language Processing (NLP)**, SRF offers smart, accurate responses without the heavy resource costs of traditional Machine Learning models.

---

## 🚀 Features

* 🔍 **Intent Detection** — Accurately detects the intent behind each message.
* 🏹 **Custom Actions** — Define tailored actions triggered by detected intents.
* 🌍 **Language Detection** — Identifies the language of incoming messages.
* 🔌 **Connectors** — Seamlessly integrates with external services for dynamic responses.
* 🌐 **Web Interface** *(Experimental)* — Intuitive UI for testing and managing intents.

---

## 📦 Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```
3. Rename `config.example.json` to `config.json` and set up your configuration.
4. Start the server:

   ```bash
   npm run start
   ```

---

## 💡 Usage

SRF supports multiple interaction methods:

### ✅ REST API

Send a `POST` request to `/api/message` to get intelligent responses.

**Request:**

```json
{
  "message": "Hello",
  "language": "en" // Optional
}
```

**Response:**

```json
{
  "intent": "example_intent",
  "message": "Response message",
  "trigger": ["example_trigger"]
}
```

### 🔌 Connectors

Integrate with external services to extend SRF's capabilities.

**Supported Connectors:**

* **Discord** — Connects to Discord for real-time interaction.

**Discord Configuration (in `config.json`):**

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

**Auto Response:**

* Enable automatic replies within specified channels.
* Use `ignoreInvalid: true` to filter only valid intents.

### 💻 CLI (For Development)

Launch with development mode to use the CLI:

```bash
npm run dev
```

Note: This disables all connectors.

### 🌐 Web Interface

> [!WARNING]
> The web interface is still in development and may not be fully stable. Please use with caution and provide feedback for improvements. May not be suitable and secure for public deployment yet. Use only as local development tool.

Enable in `config.json`:

```json
"server": {
  "web": {
    "enabled": true
  }
}
```

Access at `http://localhost:3000/`
* Chat UI (`/chat`)
* Intent explorer (`/explorer`)
* Intent editor (`/editor`, access via editor page)

**Security Tip:**
Configure `server.auth` to restrict access and prevent unauthorized changes.

---

## 🧠 Creating a Smart Responder

Organize your intents within the `intents` directory using a flexible structure:

```
intents/
├── (support)/
│   └── [en]/
│       └── help_request.json
```

### 🌍 Language Folders

Each folder named using the format `[language]`, where `language` is a valid ISO 639-1 code (e.g., `[en]`, `[fr]`, `[pl]`), is treated as a language folder.

* Language folders can appear at any level of the tree.
* You **must not** nest one language folder inside another. Doing so will result in an error.
* Intents must be located inside a language folder to be processed.

### 🗂️ Group Folders

Group folders use parentheses (e.g., `(support)`, `(feedback)`) and serve as organizational units that are also stored as metadata in the intent data.

* Group folders can be nested freely and deeply.
* The full group path is retained and can be used for features like restricting responses to specific intent groups.
* There are no naming restrictions for group folders.

**Example Structure:**

```
intents/
├── (support)/
│   └── (billing)/
│       └── [en]/
│           └── refund_request.json
├── (feedback)/
│   └── [en]/
│       └── rate_experience.json
```

### 📄 Static Intents

Respond with predefined messages.
**File types:** `.json`, `.yaml`, `.yml`

**Required properties:**

* `samples`: Example phrases.
* `response`: Reply message.
* `triggerActions`: Actions to execute.

### ⚙️ Dynamic Intents

Generate responses via code.
**File type:** `.js`

**Required properties:**

* `samples`: Example phrases.
* `generateResponse()`: Function returning a response string.
* `triggerActions`: Actions to execute.

### ✍️ Sample Writing Best Practices

* Use full, grammatically correct sentences.
* Provide at least 5 examples per intent.
* Ensure variety to improve detection accuracy.

### 🎯 Understanding Triggers

Triggers are identifiers for custom actions you define. These are just strings — implementation depends on you or the connector used.

---

## 📜 License

Licensed under the **GNU General Public License v3.0**. See the `LICENSE` file for more details.

---

Start building smarter responders with **SRF** — the framework designed for speed, flexibility, and clarity.