const API_KEY = "YOUR_API_KEY";

let satellites = [];
let markers = [];

const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

async function fetchData() {
  const res = await fetch(`https://aviation-edge.com/v2/public/satelliteDetails?key=${API_KEY}&limit=200`);
  const data = await res.json();

  satellites = data.slice(0, 200);
  render(satellites);
}

function render(data) {
  showList(data);
  showMap(data);
}

function showList(data) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(sat => {
    const lat = sat.result?.geography?.lat;
    const lon = sat.result?.geography?.lon;
    const alt = sat.result?.geography?.alt;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${sat.name}</h3>
      <p>ID: ${sat.code}</p>
      <p>Altitude: ${alt || "N/A"}</p>
    `;
    list.appendChild(div);
  });
}

function showMap(data) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  data.forEach(sat => {
    const lat = sat.result?.geography?.lat;
    const lon = sat.result?.geography?.lon;

    if (!lat || !lon) return;

    const marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${sat.name}</b>`);

    markers.push(marker);
  });
}

function searchData(query) {
  return satellites.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    String(s.code).includes(query)
  );
}

function sortData(key) {
  return [...satellites].sort((a, b) => {
    const aVal = a.result?.geography?.[key] || 0;
    const bVal = b.result?.geography?.[key] || 0;
    return bVal - aVal;
  });
}

document.getElementById("search").addEventListener("input", e => {
  const filtered = searchData(e.target.value);
  render(filtered);
});

document.getElementById("sort").addEventListener("change", e => {
  const sorted = sortData(e.target.value);
  render(sorted);
});

fetchData();