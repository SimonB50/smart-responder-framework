import Core from "./core.js";

await Core.load(); // Prepare Smart Responder and train NLP model
await Core.handleStart(); // Start web server and connectors (or CLI in dev mode)
