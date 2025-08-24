import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.')); // sert index.html et fichiers statiques

// --- Chargement des données JSON ---
const clubsData = JSON.parse(fs.readFileSync('data/clubs.json'));
const shopsData = JSON.parse(fs.readFileSync('data/shops.json'));
const eventsData = JSON.parse(fs.readFileSync('data/events.json'));

// --- Endpoint Chat classique ---
app.post('/ask', async (req,res) => {
  const { question } = req.body;

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': 'Bearer VOTRE_CLE_OPENAI' // remplace par ta clé
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages:[{role:'user', content: question}]
      })
    });
    const data = await apiResponse.json();
    const answer = data.choices[0].message.content;
    res.json({ answer });
  } catch(err) {
    console.error(err);
    res.status(500).json({ answer: "L'IA ne répond pas pour le moment." });
  }
});

// --- Endpoint filtrage IA ---
app.post('/ask-filter', async (req,res) => {
  const { question } = req.body;
  const lowerQ = question.toLowerCase();

  // Mapping des types
  const typeMap = {
    club: clubsData,
    magasin: shopsData,
    boutique: shopsData,
    shop: shopsData,
    evenement: eventsData,
    événement: eventsData,
    marathon: eventsData
  };

  let result = [];
  for(const key in typeMap) {
    if(lowerQ.includes(key)) {
      result = typeMap[key];
      break;
    }
  }

  // Filtrer par ville
  const cities = ['paris','lyon','marseille','toulouse','bordeaux','nice','nantes','lille','grenoble'];
  const cityMatch = cities.find(c => lowerQ.includes(c));
  if(cityMatch) result = result.filter(item => item.city.toLowerCase() === cityMatch);

  res.json({ filtered: result });
});

app.listen(3000, () => console.log('Serveur IA sur http://localhost:3000'));
