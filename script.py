import requests
import json

OUTPUT_FILE = "data.json"

data = []

# === 1. Clubs (FFA Open Data) ===
print("📥 Téléchargement des clubs FFA...")
clubs_url = "https://www.athle.fr/FFA/OpensData/clubs.json"
try:
    clubs = requests.get(clubs_url).json()
    for c in clubs:
        data.append({
            "type": "club",
            "name": c.get("nom", "Club sans nom"),
            "city": c.get("ville", ""),
            "address": c.get("adresse", ""),
            "website": c.get("siteweb", ""),
            "desc": "Club affilié à la FFA"
        })
except Exception as e:
    print("Erreur clubs:", e)

# === 2. Magasins (liste fixe à compléter) ===
print("📥 Ajout des magasins Running Conseil & Endurance Shop...")
shops = [
    {"name": "Running Conseil Paris", "city": "Paris", "address": "64 rue de Rennes, 75006 Paris", "website": "https://running-conseil.com"},
    {"name": "Endurance Shop Lyon", "city": "Lyon", "address": "Rue Vendôme, 69006 Lyon", "website": "https://enduranceshop.com"},
    {"name": "Running Conseil Marseille", "city": "Marseille", "address": "48 rue Paradis, 13006 Marseille", "website": "https://running-conseil.com"},
    # 👉 Tu pourras en ajouter autant que tu veux ici (liste officielle dispo sur leur site)
]
for s in shops:
    s["type"] = "shop"
    s["desc"] = "Magasin spécialisé running"
    data.append(s)

# === 3. Évènements (FFA Courses hors stade) ===
print("📥 Téléchargement des courses FFA...")
events_url = "https://www.athle.fr/FFA/OpensData/calendrier.json"
try:
    events = requests.get(events_url).json()
    for e in events[:300]:  # limite pour ne pas avoir un fichier énorme
        data.append({
            "type": "event",
            "name": e.get("nom", "Événement sans nom"),
            "city": e.get("ville", ""),
            "address": e.get("lieu", ""),
            "website": e.get("siteweb", ""),
            "desc": f"Course hors stade ({e.get('date')})"
        })
except Exception as e:
    print("Erreur événements:", e)

# === 4. Sauvegarde JSON ===
print(f"💾 Sauvegarde dans {OUTPUT_FILE}...")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Fichier data.json généré avec succès !")
