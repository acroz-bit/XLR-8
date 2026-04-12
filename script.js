const coinList = document.getElementById("coinList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const statusMessage = document.getElementById("statusMessage");

let coins = [];

async function getCoins() {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h";

  try {
    const response = await fetch(url);
    coins = await response.json();
    showCoins();
  } catch (error) {
    statusMessage.textContent = "Could not load coins. Please try again later.";
  }
}

function getWatchlist() {
  const savedCoins = localStorage.getItem("watchlist");
  return savedCoins ? JSON.parse(savedCoins) : [];
}

function saveWatchlist(watchlist) {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

function isInWatchlist(coinId) {
  return getWatchlist().includes(coinId);
}

function toggleWatchlist(coinId) {
  let watchlist = getWatchlist();

  if (watchlist.includes(coinId)) {
    watchlist = watchlist.filter(function (id) {
      return id !== coinId;
    });
  } else {
    watchlist.push(coinId);
  }

  saveWatchlist(watchlist);
  showCoins();
}

function getFilteredCoins() {
  const searchText = searchInput.value.toLowerCase();

  return coins.filter(function (coin) {
    return (
      coin.name.toLowerCase().includes(searchText) ||
      coin.symbol.toLowerCase().includes(searchText)
    );
  });
}

function sortCoins(coinArray) {
  const sortValue = sortSelect.value;

  if (sortValue === "price_desc") {
    coinArray.sort(function (a, b) {
      return b.current_price - a.current_price;
    });
  } else if (sortValue === "price_asc") {
    coinArray.sort(function (a, b) {
      return a.current_price - b.current_price;
    });
  } else if (sortValue === "change_desc") {
    coinArray.sort(function (a, b) {
      return b.price_change_percentage_24h - a.price_change_percentage_24h;
    });
  } else if (sortValue === "change_asc") {
    coinArray.sort(function (a, b) {
      return a.price_change_percentage_24h - b.price_change_percentage_24h;
    });
  } else {
    coinArray.sort(function (a, b) {
      return b.market_cap - a.market_cap;
    });
  }
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

function createCoinCard(coin) {
  const changeClass =
    coin.price_change_percentage_24h >= 0 ? "positive" : "negative";
  const buttonText = isInWatchlist(coin.id)
    ? "Remove Watchlist"
    : "Add Watchlist";

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
        <button class="btn secondary" onclick="toggleWatchlist('${coin.id}')">
          ${buttonText}
        </button>
      </div>
    </article>
  `;
}

function showCoins() {
  const filteredCoins = getFilteredCoins();
  sortCoins(filteredCoins);

  if (filteredCoins.length === 0) {
    statusMessage.textContent = "No coins found.";
    coinList.innerHTML = "";
    return;
  }

  statusMessage.textContent = "Showing " + filteredCoins.length + " coins.";
  coinList.innerHTML = filteredCoins.map(createCoinCard).join("");
}

searchInput.addEventListener("input", showCoins);
sortSelect.addEventListener("change", showCoins);

getCoins();
