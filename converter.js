const coinSelect = document.getElementById("coinSelect");
const amountInput = document.getElementById("amountInput");
const currencySelect = document.getElementById("currencySelect");
const convertButton = document.getElementById("convertButton");
const resultBox = document.getElementById("resultBox");

let coins = [];

async function getCoins() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false";

  try {
    const response = await fetch(url);
    coins = await response.json();
    fillCoinOptions();
    convertCurrency();
  } catch (error) {
    resultBox.textContent = "Could not load prices. Please try again later.";
  }
}

function fillCoinOptions() {
  coinSelect.innerHTML = coins
    .map(function (coin) {
      return `<option value="${coin.id}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
    })
    .join("");
}

async function getPrice(coinId, currency) {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    coinId +
    "&vs_currencies=" +
    currency;

  const response = await fetch(url);
  const data = await response.json();
  return data[coinId][currency];
}

function getCurrencySymbol(currency) {
  if (currency === "inr") {
    return "Rs. ";
  }

  if (currency === "eur") {
    return "EUR ";
  }

  if (currency === "gbp") {
    return "GBP ";
  }

  return "$";
}

async function convertCurrency() {
  const coinId = coinSelect.value;
  const currency = currencySelect.value;
  const amount = Number(amountInput.value);

  if (!coinId || amount < 0) {
    resultBox.textContent = "Please enter a valid amount.";
    return;
  }

  resultBox.textContent = "Calculating...";

  try {
    const price = await getPrice(coinId, currency);
    const total = amount * price;
    const coinName = coinSelect.options[coinSelect.selectedIndex].text;
    const symbol = getCurrencySymbol(currency);

    resultBox.textContent =
      amount +
      " " +
      coinName +
      " = " +
      symbol +
      total.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch (error) {
    resultBox.textContent = "Could not convert right now.";
  }
}

convertButton.addEventListener("click", convertCurrency);
coinSelect.addEventListener("change", convertCurrency);
currencySelect.addEventListener("change", convertCurrency);
amountInput.addEventListener("input", convertCurrency);

getCoins();
