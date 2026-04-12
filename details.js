const detailsBox = document.getElementById("detailsBox");
const statusMessage = document.getElementById("statusMessage");

const params = new URLSearchParams(window.location.search);
const coinId = params.get("id");

async function getCoinDetails() {
  if (!coinId) {
    statusMessage.textContent = "No coin selected.";
    return;
  }

  const url =
    "https://api.coingecko.com/api/v3/coins/" +
    coinId +
    "?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false";

  try {
    const response = await fetch(url);
    const coin = await response.json();
    showDetails(coin);
  } catch (error) {
    statusMessage.textContent = "Could not load coin details.";
  }
}

function formatMoney(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return "$" + Number(value).toLocaleString();
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return value.toFixed(2) + "%";
}

function cleanDescription(text) {
  if (!text) {
    return "No description available.";
  }

  return text.replace(/<[^>]*>/g, "").split(". ").slice(0, 4).join(". ") + ".";
}

function showDetails(coin) {
  const market = coin.market_data;
  const change = market.price_change_percentage_24h;
  const changeClass = change >= 0 ? "positive" : "negative";

  statusMessage.textContent = "";

  detailsBox.innerHTML = `
    <article class="details-card">
      <div>
        <img class="details-image" src="${coin.image.large}" alt="${
    coin.name
  } logo" />
      </div>

      <div>
        <h2>${coin.name}</h2>
        <p class="details-symbol">${coin.symbol}</p>

        <div class="details-grid">
          <div class="details-box">
            <span>Current Price</span>
            <strong>${formatMoney(market.current_price.usd)}</strong>
          </div>
          <div class="details-box">
            <span>Market Cap</span>
            <strong>${formatMoney(market.market_cap.usd)}</strong>
          </div>
          <div class="details-box">
            <span>24h High</span>
            <strong>${formatMoney(market.high_24h.usd)}</strong>
          </div>
          <div class="details-box">
            <span>24h Low</span>
            <strong>${formatMoney(market.low_24h.usd)}</strong>
          </div>
          <div class="details-box">
            <span>24h Price Change</span>
            <strong class="${changeClass}">${formatPercent(change)}</strong>
          </div>
          <div class="details-box">
            <span>Market Rank</span>
            <strong>#${coin.market_cap_rank}</strong>
          </div>
        </div>

        <p class="description">${cleanDescription(coin.description.en)}</p>
      </div>
    </article>
  `;
}

getCoinDetails();
