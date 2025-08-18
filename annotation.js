let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let drawing = false;
let img = new Image();

// Load screenshot from query param
const params = new URLSearchParams(window.location.search);
const screenshot = params.get("img");

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};
img.src = screenshot;

// Drawing
canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "red";
  ctx.lineCap = "round";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// Clear button
document.getElementById("clear").addEventListener("click", () => {
  ctx.drawImage(img, 0, 0);
});

// Save button
document.getElementById("save").addEventListener("click", () => {
  const editedDataURL = canvas.toDataURL("image/png");
  console.log("save clicking.................");
  // Send back to background for storage
  chrome.runtime.sendMessage({
    type: "saveAnnotatedImage",
    dataUrl: editedDataURL,
  });

  window.close(); // Close popup after saving
});
