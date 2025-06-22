const closeButton = document.getElementById("close-editor");
const intentName = document.getElementById("intent-name");

if (!sessionStorage.getItem("authToken")) {
  window.location.href = "/";
}

const loadSamples = async (samples) => {
  for (const sample of samples) {
    const sampleDiv = document.createElement("div");
    sampleDiv.className = "editor-sample";
    sampleDiv.innerHTML = `
    <input type="text" placeholder="Sample" value="${sample}" />
    <button class="delete-sample">Delete</button>
  `;
    sampleDiv.querySelector(".delete-sample").addEventListener("click", (e) => {
      e.preventDefault();
      sampleDiv.remove();
    });
    document.querySelector(".editor-samples-list").appendChild(sampleDiv);
  }
  const addSampleButton = document.getElementById("add-sample");
  addSampleButton.addEventListener("click", (e) => {
    e.preventDefault();
    const newSample = document.createElement("div");
    newSample.className = "editor-sample";
    newSample.innerHTML = `
      <input type="text" placeholder="Sample" />
      <button class="delete-sample">Delete</button>
    `;
    newSample.querySelector(".delete-sample").addEventListener("click", (e) => {
      e.preventDefault();
      newSample.remove();
    });
    document.querySelector(".editor-samples-list").appendChild(newSample);
  });
};

const loadActions = async (actions) => {
  for (const action of actions) {
    const actionDiv = document.createElement("div");
    actionDiv.className = "editor-action";
    actionDiv.innerHTML = `
      <span class="action-name">${action}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-x-icon lucide-x"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    `;
    actionDiv.addEventListener("click", (e) => {
      e.preventDefault();
      actionDiv.remove();
    });
    document.querySelector(".editor-actions-list").appendChild(actionDiv);
  }
  const addActionButton = document.getElementById("add-action");
  addActionButton.addEventListener("click", (e) => {
    e.preventDefault();
    const actionInput = document.getElementById("action-input");
    const newAction = document.createElement("div");
    newAction.className = "editor-action";
    newAction.innerHTML = `
      <span class="action-name">${actionInput.value}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-x-icon lucide-x"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    `;
    actionInput.value = "";
    newAction.addEventListener("click", (e) => {
      e.preventDefault();
      newAction.remove();
    });
    document.querySelector(".editor-actions-list").appendChild(newAction);
  });
};

const loadResponse = async (response) => {
  const responseInput = document.getElementById("response");
  responseInput.value = response;
};

const saveIntent = async () => {
  let intentData = {
    samples: [],
    triggerActions: [],
    response: "",
  };
  const samples = document.querySelectorAll(".editor-sample > input");
  samples.forEach((sample) => {
    if (sample.value) {
      intentData.samples.push(sample.value);
    }
  });
  const actions = document.querySelectorAll(".editor-action > .action-name");
  actions.forEach((action) => {
    if (action.innerHTML) {
      intentData.triggerActions.push(action.innerHTML);
    }
  });
  const response = document.getElementById("response");
  if (response.value) {
    intentData.response = response.value;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url");
  const updateResponse = await fetch(
    "/api/editor?url=" + encodeURIComponent(url),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
      },
      body: JSON.stringify(intentData),
    }
  );
  if (!updateResponse.ok) {
    alert("Error saving intent");
    return;
  }
  const data = await updateResponse.json();
  if (data.error) {
    alert("Error saving intent: " + data.error);
    return;
  }
  alert("Intent saved successfully");
};

const deleteIntent = async () => {
  const confirm = window.confirm(
    "Are you sure you want to delete this intent? This action cannot be undone."
  );
  if (!confirm) {
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url");
  const deleteResponse = await fetch(
    "/api/editor?url=" + encodeURIComponent(url),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
      },
    }
  );
  if (!deleteResponse.ok) {
    alert("Error deleting intent");
    return;
  }
  const data = await deleteResponse.json();
  if (data.error) {
    alert("Error deleting intent: " + data.error);
    return;
  }
  alert("Intent deleted successfully");
  window.location.href = "/explorer?url=" + encodeURIComponent(data.parent);
};

const load = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url");
  if (!url) {
    alert("URL not provided");
    return;
  }
  const response = await fetch(`/api/editor?url=${encodeURIComponent(url)}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken") || ""}`,
    },
  });
  if (!response.ok) {
    alert("Error loading file");
    return;
  }
  const data = await response.json();
  closeButton.addEventListener("click", () => {
    window.location.href = "/explorer?url=" + encodeURIComponent(data.parent);
  });
  loadSamples(data.data.samples);
  loadActions(data.data.triggerActions);
  loadResponse(data.data.response);
  document
    .getElementById("delete-intent")
    .addEventListener("click", deleteIntent);
  document.getElementById("save-intent").addEventListener("click", saveIntent);
  intentName.innerHTML = data.file;
};
load();
