const $ = id => document.getElementById(id);

const state = {
  generator: "Google Veo",
  prompt: localStorage.getItem("videoPrompt") || "",
  duration: localStorage.getItem("videoDuration") || "8",
  ratio: localStorage.getItem("videoRatio") || "16:9"
};

$("prompt").value = state.prompt;
$("duration").value = state.duration;
$("ratio").value = state.ratio;

function saveState() {
  localStorage.setItem("videoPrompt", $("prompt").value);
  localStorage.setItem("videoDuration", $("duration").value);
  localStorage.setItem("videoRatio", $("ratio").value);
}

["prompt","duration","ratio"].forEach(id => {
  $(id).addEventListener("input", saveState);
  $(id).addEventListener("change", saveState);
});

function updateConnection() {
  $("connection").textContent = navigator.onLine ? "ONLINE" : "OFFLINE READY";
}
window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);
updateConnection();

$("generate").addEventListener("click", () => {
  saveState();
  const prompt = $("prompt").value.trim();

  if (!prompt) {
    $("message").textContent = "Enter a prompt first.";
    return;
  }

  $("message").textContent =
    "Generator connection will be added in the next step.";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}
