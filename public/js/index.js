const authButton = document.getElementById("auth-button");
authButton.addEventListener("click", async () => {
  const authToken = sessionStorage.getItem("authToken");
  const input = window.prompt(
    "Enter your authentication token:",
    authToken || ""
  );
  sessionStorage.setItem("authToken", input);
  alert("Authentication token saved.");
});
