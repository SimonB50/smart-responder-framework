const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

sendButton.addEventListener("click", async function (event) {
  event.preventDefault();
  const message = messageInput.value;
  if (message.trim() !== "") {
    addMessage(message);
    messageInput.value = "";
    messageInput.disabled = true;
    const response = await getResponse(message);
    addMessage(response, false);
    messageInput.disabled = false;
    messageInput.focus();
  }
});

function addMessage(message, isUser = true) {
  const messageElement = document.createElement("div");
  messageElement.className = `message ${isUser ? "sent" : "received"}`;
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function getResponse(message) {
  const response = await fetch("/api/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  if (response.ok) {
    return data.message;
  } else {
    console.error("Error:", data.error);
    return "Sorry, I couldn't process your request.";
  }
}
