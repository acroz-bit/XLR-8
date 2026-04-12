const watchlistBox = document.getElementById("watchlistBox");
const statusMessage = document.getElementById("statusMessage");

let watchlistCoins = [];

function getWatchlist() {
  const savedCoins = localStorage.getItem("watchlist");
  return savedCoins ? JSON.parse(savedCoins) : [];
}

function saveWatchlist(watchlist) {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

async function getWatchlistCoins() {
  const watchlist = getWatchlist();

  if (watchlist.length === 0) {
    statusMessage.textContent = "";
    watchlistBox.className = "";
    watchlistBox.innerHTML =
      '<div class="empty-card">Your watchlist is empty. Go to the home page and add some coins.</div>';
    return;
  }

  const ids = watchlist.join(",");
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" +
    ids +
    "&order=market_cap_desc&sparkline=false&price_change_percentage=24h";

  try {
    const response = await fetch(url);
    watchlistCoins = await response.json();
    showWatchlist();
  } catch (error) {
    statusMessage.textContent = "Could not load your watchlist.";
  }
}

function removeFromWatchlist(coinId) {
  const watchlist = getWatchlist().filter(function (id) {
    return id !== coinId;
  });

  saveWatchlist(watchlist);
  getWatchlistCoins();
}

function formatMoney(value) {
  return "$" + Number(value).toLocaleString();
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return value.toFixed(2) + "%";
}

function createWatchlistCard(coin) {
  const changeClass =
    coin.price_change_percentage_24h >= 0 ? "positive" : "negative";

  return `
    <article class="coin-card">
      <div class="coin-top">
        <img src="${coin.image}" alt="${coin.name} logo" />
        <div>
          <h2 class="coin-name">${coin.name}</h2>
          <p class="coin-symbol">${coin.symbol}</p>
        </div>
      </div>

      <dl class="coin-data">
        <div>
          <dt>Price</dt>
          <dd>${formatMoney(coin.current_price)}</dd>
        </div>
        <div>
          <dt>Market Cap</dt>
          <dd>${formatMoney(coin.market_cap)}</dd>
        </div>
        <div>
          <dt>24h Change</dt>
          <dd class="${changeClass}">${formatPercent(
    coin.price_change_percentage_24h
  )}</dd>
        </div>
        <div>
          <dt>Rank</dt>
          <dd>#${coin.market_cap_rank}</dd>
        </div>
      </dl>

      <div class="card-actions">
        <a class="btn" href="details.html?id=${coin.id}">View Details</a>
        <button class="btn secondary" onclick="removeFromWatchlist('${coin.id}')">
          Remove
        </button>
      </div>
    </article>
  `;
}

function showWatchlist() {
  statusMessage.textContent =
    "Showing " + watchlistCoins.length + " saved coins.";
  watchlistBox.className = "coin-grid";
  watchlistBox.innerHTML = watchlistCoins.map(createWatchlistCard).join("");
}

getWatchlistCoins();
