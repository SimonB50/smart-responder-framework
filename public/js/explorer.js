const mainContainer = document.getElementById("container");

if (!sessionStorage.getItem("authToken")) {
  window.location.href = "/";
}

const addFolder = (folder) => {
  const folderElement = document.createElement("div");
  folderElement.className = "folder";
  folderElement.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-icon lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
  folderElement.innerHTML += `<span>${folder.name}</span>`;
  folderElement.addEventListener("click", async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("url", folder.path);
    window.history.pushState({}, "", url);
    await load();
  });
  mainContainer.appendChild(folderElement);
};
const addDynamicFile = (file) => {
  const fileElement = document.createElement("div");
  fileElement.className = "file";
  fileElement.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-code2-icon lucide-file-code-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m5 12-3 3 3 3"/><path d="m9 18 3-3-3-3"/></svg>`;
  fileElement.innerHTML += `<span>${file.name}</span>`;
  fileElement.addEventListener("click", async () => {
    alert(
      "This is a dynamic file. It cannot be edited using editor interface."
    );
  });
  mainContainer.appendChild(fileElement);
};
const addStaticFile = (file) => {
  const fileElement = document.createElement("div");
  fileElement.className = "file";
  fileElement.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-json2-icon lucide-file-json-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M8 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`;
  fileElement.innerHTML += `<span>${file.name}</span>`;
  fileElement.addEventListener("click", async () => {
    window.location.href = `/editor?url=${encodeURIComponent(file.path)}`;
  });
  mainContainer.appendChild(fileElement);
};

const newIntentButton = document.getElementById("add-intent");
newIntentButton.addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url") || ".";
  let input = window.prompt(
    "Enter the name of the new intent (without extension):",
    "new-intent"
  );
  if (!input) {
    alert("Intent name cannot be empty.");
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
    alert(
      "Invalid intent name. Only alphanumeric characters, underscores, and hyphens are allowed."
    );
    return;
  }
  if (input.length > 50) {
    alert("Intent name is too long. Maximum length is 50 characters.");
    return;
  }
  if (
    !input.endsWith(".json") &&
    !input.endsWith(".yml") &&
    !input.endsWith(".yaml")
  ) {
    input += ".json"; // Default to JSON if no extension is provided
  }
  const createIntentResponse = await fetch(
    `/api/editor?url=${encodeURIComponent(`${url}/${input}`)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
      },
    }
  );
  if (!createIntentResponse.ok) {
    console.error(
      "Error creating new intent:",
      createIntentResponse.statusText
    );
    return;
  }
  const data = await createIntentResponse.json();
  if (data.error) {
    alert("Error creating new intent: " + data.error);
    return;
  }
  await load();
});

const newFolderButton = document.getElementById("add-folder");
newFolderButton.addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url") || ".";
  let input = window.prompt("Enter the name of the new folder:", "new-folder");
  if (!input) {
    alert("Folder name cannot be empty.");
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
    alert(
      "Invalid folder name. Only alphanumeric characters, underscores, and hyphens are allowed."
    );
    return;
  }
  if (input.length > 50) {
    alert("Folder name is too long. Maximum length is 50 characters.");
    return;
  }
  const createFolderResponse = await fetch(
    `/api/explorer?url=${encodeURIComponent(`${url}/${input}`)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
      },
    }
  );
  if (!createFolderResponse.ok) {
    console.error(
      "Error creating new folder:",
      createFolderResponse.statusText
    );
    return;
  }
  await load();
});

const load = async () => {
  mainContainer.innerHTML = "";
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url") || ".";
  const response = await fetch(`/api/explorer?url=${encodeURIComponent(url)}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
    },
  });
  if (!response.ok) {
    console.error("Error fetching data:", response.statusText);
    return;
  }
  const data = await response.json();
  if (data.error) {
    console.error("Error:", data.error);
    return;
  }
  for (const folder of data.folders) {
    addFolder(folder);
  }
  for (const file of data.files) {
    if (file.name.endsWith(".js")) {
      addDynamicFile(file);
    } else {
      addStaticFile(file);
    }
  }
};

window.addEventListener("popstate", () => {
  load();
});

load();
