let clubsData = [], shopsData = [], eventsData = [];
const markersCluster = L.markerClusterGroup();

// Carte Leaflet
const map = L.map('map').setView([46.6, 2.4], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
map.addLayer(markersCluster);

// Affichage des listes
function displayList(data, elementId) {
  const list = document.getElementById(elementId);
  list.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.name}</strong> - ${item.city} ${item.website ? `<a href="${item.website}" target="_blank">Site</a>` : ''} <button class="fav-btn">★</button>`;
    list.appendChild(li);

    const btn = li.querySelector('.fav-btn');
    const favs = JSON.parse(localStorage.getItem('favs')) || [];
    if (favs.find(f => f.name === item.name && f.type === item.type)) btn.style.color = 'gold';

    btn.addEventListener('click', () => {
      let favs = JSON.parse(localStorage.getItem('favs')) || [];
      const index = favs.findIndex(f => f.name === item.name && f.type === item.type);
      if (index > -1) {
        favs.splice(index, 1);
        btn.style.color = 'black';
      } else {
        favs.push(item);
        btn.style.color = 'gold';
      }
      localStorage.setItem('favs', JSON.stringify(favs));
    });
  });
}

// Ajouter markers à la carte
function addMarkers(data) {
  markersCluster.clearLayers();
  data.forEach(item => {
    if (item.lat && item.lng) {
      const marker = L.marker([item.lat, item.lng]).bindPopup(
        `<strong>${item.name}</strong><br>${item.city}<br>${item.desc || ''}<br>${item.website ? `<a href="${item.website}" target="_blank">Site</a>` : ''}`
      );
      markersCluster.addLayer(marker);
    }
  });
}

// Charger data.json
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    clubsData = data.filter(d => d.type === 'club');
    shopsData = data.filter(d => d.type === 'shop');
    eventsData = data.filter(d => d.type === 'event');

    displayList(clubsData, 'club-list');
    displayList(shopsData, 'shop-list');
    displayList(eventsData, 'event-list');

    addMarkers(data);

    // Centrer la carte sur tous les markers
    const allLatLng = data.filter(d => d.lat && d.lng).map(d => [d.lat, d.lng]);
    if (allLatLng.length) {
      const bounds = L.latLngBounds(allLatLng);
      map.fitBounds(bounds);
    }
  })
  .catch(err => console.error('Erreur data.json :', err));

// Recherche globale
document.getElementById('global-search').addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  const filterData = data => data.filter(d => d.name.toLowerCase().includes(query) || d.city.toLowerCase().includes(query) || (d.desc && d.desc.toLowerCase().includes(query)));

  displayList(filterData(clubsData), 'club-list');
  displayList(filterData(shopsData), 'shop-list');
  displayList(filterData(eventsData), 'event-list');

  // Mettre à jour la carte avec les résultats filtrés
  addMarkers([...filterData(clubsData), ...filterData(shopsData), ...filterData(eventsData)]);
});

// Chatbot basique
const chatToggle = document.getElementById('chat-toggle');
const chatPanel = document.getElementById('chatbot');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');

chatToggle.addEventListener('click', () => chatPanel.style.display = (chatPanel.style.display === 'flex' ? 'none' : 'flex'));

chatInput.addEventListener('keypress', e => {
  if (e.key === 'Enter' && chatInput.value.trim() !== '') {
    const userMsg = chatInput.value.trim();
    const p = document.createElement('p');
    p.innerHTML = `<strong>Vous:</strong> ${userMsg}`;
    chatWindow.appendChild(p);

    let botMsg = 'Désolé, je n\'ai pas compris.';
    const msgLower = userMsg.toLowerCase();

    if (msgLower.includes('club')) botMsg = `Il y a ${clubsData.length} clubs disponibles.`;
    else if (msgLower.includes('magasin') || msgLower.includes('shop')) botMsg = `Il y a ${shopsData.length} magasins référencés.`;
    else if (msgLower.includes('événement') || msgLower.includes('course')) botMsg = `Il y a ${eventsData.length} événements planifiés.`;

    const pBot = document.createElement('p');
    pBot.innerHTML = `<strong>Bot:</strong> ${botMsg}`;
    chatWindow.appendChild(pBot);

    chatInput.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
