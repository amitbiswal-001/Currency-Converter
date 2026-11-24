const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const FALLBACK_URL =
  "https://latest.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const form = document.querySelector("form");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const amount = document.querySelector(".amount input");

// Fill currency dropdowns
for (const select of dropdowns) {
  for (const currCode in countryList) {
    const newOption = document.createElement("option");

    newOption.innerText = currCode;
    newOption.value = currCode;

    if (select.name === "from" && currCode === "USD") {
      newOption.selected = true;
    }

    if (select.name === "to" && currCode === "INR") {
      newOption.selected = true;
    }

    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

// Update country flags
const updateFlag = (element) => {
  const currCode = element.value;
  const countryCode = countryList[currCode];

  const img = element.parentElement.querySelector("img");

  if (countryCode) {
    img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  }
};

// Fetch exchange rate
const updateExchangeRate = async () => {
  let amtVal = Number(amount.value);

  if (!Number.isFinite(amtVal) || amtVal <= 0) {
    amtVal = 1;
    amount.value = "1";
  }

  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();

  msg.innerText = "Getting exchange rate...";

  try {
    let response;

    try {
      response = await fetch(`${BASE_URL}/${from}.json`);

      if (!response.ok) {
        throw new Error("Primary API failed");
      }
    } catch (error) {
      response = await fetch(`${FALLBACK_URL}/${from}.json`);

      if (!response.ok) {
        throw new Error("Backup API failed");
      }
    }

    const data = await response.json();
    const rate = data[from]?.[to];

    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new Error("Currency rate not available");
    }

    const finalAmount = amtVal * rate;

    msg.innerText =
      `${amtVal} ${fromCurr.value} = ${finalAmount.toFixed(2)} ${toCurr.value}`;

  } catch (error) {
    console.error("Currency API Error:", error);
    msg.innerText = "Unable to get exchange rate. Try again!";
  }
};

// Form submit
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

// Update on page load
window.addEventListener("load", () => {
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});