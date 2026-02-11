// Helper: convert base to a unit type ("weight" or "count") and normalise to gram or piece
function unitCategory(u) {
  if (u === "kg" || u === "g") return "weight";
  return "count";
}
function toGrams(q, u) {
  if (u === "kg") return q * 1000;
  if (u === "g") return q;
  return null;
}
function toPieces(q, u) {
  if (u === "piece") return q;
  if (u === "dozen") return q * 12;
  return null;
}

function roundSmart(x) {
  if (!isFinite(x)) return x;
  if (Math.abs(x) < 0.01) return Number(x.toFixed(4));
  if (Math.abs(x) < 1) return Number(x.toFixed(3));
  return Number(x.toFixed(2));
}

function showResult(html, note = "") {
  document.getElementById("result").innerHTML = html;
  document.getElementById("notes").textContent = note;
}

function calculate() {
  const baseQty = parseFloat(document.getElementById("baseQty").value);
  const baseUnit = document.getElementById("baseUnit").value;
  const basePrice = parseFloat(document.getElementById("basePrice").value);
  const desiredValue = parseFloat(
    document.getElementById("desiredValue").value,
  );
  const desiredUnit = document.getElementById("desiredUnit").value;
  const modeQty = document.getElementById("modeQty").checked;

  if (isNaN(baseQty) || baseQty <= 0 || isNaN(basePrice) || basePrice <= 0) {
    showResult(
      '<div class="text-danger">Base quantity aur price sahi daalein.</div>',
    );
    return;
  }

  // Determine category
  const baseCat = unitCategory(baseUnit);
  const desiredCat = unitCategory(desiredUnit);

  // Compute price per smallest unit: per gram or per piece
  let pricePerGram = null,
    pricePerPiece = null;
  if (baseCat === "weight") {
    const grams = toGrams(baseQty, baseUnit);
    pricePerGram = basePrice / grams; // ₹ per gram
  } else {
    const pieces = toPieces(baseQty, baseUnit);
    pricePerPiece = basePrice / pieces; // ₹ per piece
  }

  // If desiredUnit is rupee => user wants quantity for given rupees
  if (desiredUnit === "rupee") {
    if (isNaN(desiredValue) || desiredValue <= 0) {
      showResult('<div class="text-danger">Valid rupee amount daaliye.</div>');
      return;
    }
    if (baseCat === "weight") {
      const grams = desiredValue / pricePerGram; // grams
      const kg = grams / 1000;
      showResult(
        `<strong>₹ ${roundSmart(desiredValue)} mein aapko:</strong> <br> ${roundSmart(grams)} g (${roundSmart(kg)} kg)`,
      );
    } else {
      const pieces = desiredValue / pricePerPiece;
      const dozens = pieces / 12;
      showResult(
        `<strong>₹ ${roundSmart(desiredValue)} mein aapko:</strong> <br> ${roundSmart(pieces)} piece (${roundSmart(dozens)} dozen)`,
      );
    }
    return;
  }

  // If desired is weight or piece, compute price
  if (desiredCat === "weight" && baseCat === "weight") {
    if (isNaN(desiredValue) || desiredValue <= 0) {
      showResult(
        '<div class="text-danger">Valid desired quantity daaliye.</div>',
      );
      return;
    }
    let desiredGrams = toGrams(desiredValue, desiredUnit);
    if (desiredGrams === null) {
      showResult(
        '<div class="text-danger">Desired unit conversion error.</div>',
      );
      return;
    }
    const price = desiredGrams * pricePerGram;
    showResult(
      `<strong>${desiredValue} ${desiredUnit} ka daam:</strong> ₹ ${roundSmart(price)}`,
      `Base: ${baseQty} ${baseUnit} = ₹ ${basePrice}. (₹ ${roundSmart(pricePerGram)} per g)`,
    );
    return;
  }

  if (desiredCat === "count" && baseCat === "count") {
    if (isNaN(desiredValue) || desiredValue <= 0) {
      showResult(
        '<div class="text-danger">Valid desired quantity daaliye.</div>',
      );
      return;
    }
    let desiredPieces = toPieces(desiredValue, desiredUnit);
    if (desiredPieces === null) {
      showResult(
        '<div class="text-danger">Desired unit conversion error.</div>',
      );
      return;
    }
    const price = desiredPieces * pricePerPiece;
    showResult(
      `<strong>${desiredValue} ${desiredUnit} ka daam:</strong> ₹ ${roundSmart(price)}`,
      `Base: ${baseQty} ${baseUnit} = ₹ ${basePrice}. (₹ ${roundSmart(pricePerPiece)} per piece)`,
    );
    return;
  }

  // Mixed conversions: if base is weight but desired is piece (or vice versa) not possible without density etc.
  showResult(
    '<div class="text-warning">Base unit aur desired unit alag prakaar ke hain (weight vs count). Is conversion ke liye extra info chahiye (jaise 1 piece ka wajan).</div>',
  );
}

// Event listeners
document.getElementById("calcBtn").addEventListener("click", calculate);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("baseQty").value = 1;
  document.getElementById("baseUnit").value = "kg";
  document.getElementById("basePrice").value = 100;
  document.getElementById("desiredValue").value = "";
  document.getElementById("desiredUnit").value = "g";
  document.getElementById("modeQty").checked = true;
  showResult("");
});

// Examples
document.getElementById("example1").addEventListener("click", () => {
  // 1 kg = ₹42, check 50g and ₹10
  document.getElementById("baseQty").value = 1;
  document.getElementById("baseUnit").value = "kg";
  document.getElementById("basePrice").value = 42;
  document.getElementById("desiredValue").value = 50;
  document.getElementById("desiredUnit").value = "g";
  calculate();
});

document.getElementById("example2").addEventListener("click", () => {
  // 12 banana = ₹60 -> how many for ₹20
  document.getElementById("baseQty").value = 12;
  document.getElementById("baseUnit").value = "dozen";
  document.getElementById("basePrice").value = 60;
  document.getElementById("desiredValue").value = 20;
  document.getElementById("desiredUnit").value = "rupee";
  calculate();
});

// Allow pressing Enter in desiredValue to calculate
document
  .getElementById("desiredValue")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") calculate();
  });
