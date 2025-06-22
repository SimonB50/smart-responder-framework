import fs from "fs/promises";
import path from "path";
import Utils from "./utils.js";
import yaml from "yaml";

const __dirname = Utils.getDirname(import.meta.url);

/**
 * @param {import("fastify").FastifyInstance} app - The Fastify instance
 */
const setup = async (app) => {
  // CHAT
  app.get("/chat", async (request, reply) => {
    return reply.sendFile("chat.html");
  });

  // EXPLORER
  const validateExplorerRequest = async (request, reply, invert = false) => {
    let { url } = request.query;
    if (!url) url = ".";
    url = decodeURIComponent(url);
    const urlPath = path.join(__dirname, "intents", url);
    if (!Utils.isIntent(urlPath) || (await Utils.exists(urlPath)) == invert) {
      return reply.status(404).send({ error: "File not found" });
    }
    return { url, urlPath };
  };
  app.get("/explorer", async (request, reply) => {
    await validateExplorerRequest(request, reply);
    return reply.sendFile("explorer.html");
  });
  app.get("/api/explorer", async (request, reply) => {
    const { url, urlPath } = await validateExplorerRequest(request, reply);
    try {
      if (await Utils.isFolder(urlPath)) {
        const files = await fs.readdir(urlPath);
        const folders = [];
        const filesList = [];
        const parentFolder = {
          name: "..",
          path: path.join(url, ".."),
        };
        if (path.join(urlPath, "..") !== __dirname) {
          folders.push(parentFolder);
        }
        for (const file of files) {
          const filePath = path.join(urlPath, file);
          const fileObject = {
            name: file,
            path: path.join(url, file),
          };
          if (await Utils.isFolder(filePath)) {
            folders.push(fileObject);
          } else {
            if (![".js", ".json", ".yml", ".yaml"].includes(path.extname(file)))
              continue;
            filesList.push(fileObject);
          }
        }
        return reply.send({ folders, files: filesList });
      }
      return reply.send("unsupported file type");
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });
  app.put("/api/explorer", async (request, reply) => {
    const { url, urlPath } = await validateExplorerRequest(
      request,
      reply,
      true
    );
    try {
      await fs.mkdir(urlPath, { recursive: true });
      return reply.send({
        message: "Folder created successfully",
      });
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // EDITOR
  const validateEditorRequest = async (request, reply, invert = false) => {
    const { url } = request.query;
    if (!url) return reply.status(400).send({ error: "URL not provided" });
    const urlPath = path.join(__dirname, "intents", url);
    if (!Utils.isIntent(urlPath) || (await Utils.exists(urlPath)) == invert) {
      return reply.status(404).send({ error: "File not found" });
    }
    if (!invert && (await Utils.isFolder(urlPath))) {
      return reply.status(400).send({ error: "URL is a folder" });
    }
    const fileExtension = path.extname(urlPath);
    if (![".json", ".yml", ".yaml"].includes(fileExtension)) {
      return reply.status(400).send({ error: "Unsupported file type" });
    }
    return { url, urlPath, fileExtension };
  };
  app.get("/editor", async (request, reply) => {
    await validateEditorRequest(request, reply);
    return reply.sendFile("editor.html");
  });
  app.get("/api/editor", async (request, reply) => {
    const { url, urlPath, fileExtension } = await validateEditorRequest(
      request,
      reply
    );
    try {
      const data = await fs.readFile(urlPath, "utf-8");
      let parsedData;
      if (fileExtension === ".json") {
        parsedData = JSON.parse(data);
      } else {
        parsedData = yaml.parse(data);
      }
      return reply.send({
        file: path.basename(urlPath),
        path: url,
        parent: path.dirname(url),
        data: parsedData,
      });
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });
  app.post("/api/editor", async (request, reply) => {
    const { url, urlPath, fileExtension } = await validateEditorRequest(
      request,
      reply
    );
    try {
      const data = request.body;
      let parsedData;
      if (fileExtension === ".json") {
        parsedData = JSON.stringify(data, null, 2);
      } else {
        parsedData = yaml.stringify(data);
      }
      await fs.writeFile(urlPath, parsedData, "utf-8");
      return reply.send({
        file: path.basename(urlPath),
        path: url,
        parent: path.dirname(url),
        data: parsedData,
      });
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });
  app.put("/api/editor", async (request, reply) => {
    const { url, urlPath, fileExtension } = await validateEditorRequest(
      request,
      reply,
      true
    );
    try {
      const data = {
        samples: [],
        triggerActions: [],
        response: "",
      };
      let parsedData;
      if (fileExtension === ".json") {
        parsedData = JSON.stringify(data, null, 2);
      } else {
        parsedData = yaml.stringify(data);
      }
      await fs.writeFile(urlPath, parsedData, "utf-8");
      return reply.send({
        file: path.basename(urlPath),
        path: url,
        parent: path.dirname(url),
        data: parsedData,
      });
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });
  app.delete("/api/editor", async (request, reply) => {
    const { url, urlPath } = await validateEditorRequest(request, reply);
    try {
      await fs.unlink(urlPath);
      return reply.send({
        file: path.basename(urlPath),
        path: url,
        parent: path.dirname(url),
      });
    } catch (error) {
      return reply.status(500).send({ error: error.message });
    }
  });
};
export default { setup };
