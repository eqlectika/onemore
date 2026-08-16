const $ = id => document.getElementById(id);

const state = {
  prompt: localStorage.getItem("videoPrompt") || "",
  duration: localStorage.getItem("videoDuration") || "8",
  ratio: localStorage.getItem("videoRatio") || "16:9",
  generator: localStorage.getItem("videoGenerator") || "google-veo"
};

$("prompt").value = state.prompt;
$("duration").value = state.duration;
$("ratio").value = state.ratio;
$("generator").value = state.generator;

function saveState() {
  localStorage.setItem("videoPrompt", $("prompt").value);
  localStorage.setItem("videoDuration", $("duration").value);
  localStorage.setItem("videoRatio", $("ratio").value);
  localStorage.setItem("videoGenerator", $("generator").value);
}

["prompt", "duration", "ratio", "generator"].forEach(id => {
  $(id).addEventListener("input", saveState);
  $(id).addEventListener("change", saveState);
});

function updateConnection() {
  $("connection").textContent = navigator.onLine ? "ONLINE" : "OFFLINE READY";
}

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);
updateConnection();

$("generate").addEventListener("click", async () => {
  saveState();

  const prompt = $("prompt").value.trim();
  const durationSeconds = Number($("duration").value);
  const aspectRatio = $("ratio").value;
  const provider = $("generator").value;
  const button = $("generate");

  if (!prompt) {
    $("message").textContent = "Enter a prompt first.";
    return;
  }

  button.disabled = true;
  $("message").textContent = "Connecting to Local Node...";
  $("resultBox").innerHTML = "<span>Generating video...</span>";

  try {
    const response = await fetch("http://127.0.0.1:8787/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        prompt,
        durationSeconds,
        aspectRatio
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generation failed.");
    }

    if (!data.uri) {
      throw new Error("No video URI returned.");
    }

    $("resultBox").innerHTML =
      `<video controls playsinline src="${data.uri}"></video>`;

    $("message").textContent = "Video generated.";

  } catch (error) {
    console.error(error);

    const errorText = error.message || "";

    if (provider === "magic-hour" && errorText.includes("402")) {
  $("resultBox").innerHTML = `
    <div class="generation-error">
      <strong>Insufficient Magic Hour credits</strong>
      <p>Please add credits to continue.</p>
    </div>
  `;

  $("message").textContent = "Insufficient Magic Hour credits.";

} else if (
  provider === "google-veo" &&
  (
    errorText.includes("429") ||
    errorText.includes("RESOURCE_EXHAUSTED") ||
    errorText.toLowerCase().includes("quota")
  )
) {
  $("resultBox").innerHTML = `
    <div class="generation-error">
      <strong>Google Veo quota exceeded</strong>
      <p>Please try again later.</p>
    </div>
  `;

  $("message").textContent = "Google Veo quota exceeded.";

} else {
  $("resultBox").innerHTML = `
    <div class="generation-error">
      <strong>Generation failed</strong>
      <p>${errorText}</p>
    </div>
  `;

  $("message").textContent = "Generation failed.";
}
  } finally {
    button.disabled = false;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}
