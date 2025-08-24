import pandas as pd
import json
import requests
from pathlib import Path

# -----------------------
# 1️⃣ Configuration
# -----------------------
DATA_FOLDER = Path("data_sources")
OUTPUT_FILE = "data.json"

# Sources officielles
CSV_SOURCES = {
    "clubs": DATA_FOLDER / "clubs_ffa.csv",
    "events": DATA_FOLDER / "events.csv",
    "shops": DATA_FOLDER / "shops.csv"
}

# URLs distantes (optionnel)
JSON_URLS = [
    # Exemple : "https://data.gouv.fr/fr/datasets/r/xxxx.json"
]

data = []

# -----------------------
# 2️⃣ Fonction pour lire CSV
# -----------------------
def read_csv(file_path, type_name, desc_default):
    if not file_path.exists():
        print(f"⚠️ Fichier CSV introuvable : {file_path}")
        return []
    df = pd.read_csv(file_path, sep=";", encoding="utf-8")
    entries = []
    for _, row in df.iterrows():
        entries.append({
            "type": type_name,
            "name": row["Nom"],
            "city": row["Ville"],
            "address": row.get("Adresse",""),
            "website": row.get("SiteWeb",""),
            "desc": row.get("Description", desc_default)
        })
    print(f"✅ {len(entries)} {type_name} importés depuis {file_path.name}")
    return entries

# -----------------------
# 3️⃣ Fonction pour lire JSON distant
# -----------------------
def read_json_url(url, type_name, desc_default):
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        try:
            entries_json = response.json()
            entries = []
            for item in entries_json:
                entries.append({
                    "type": type_name,
                    "name": item.get("Nom") or item.get("name",""),
                    "city": item.get("Ville") or item.get("city",""),
                    "address": item.get("Adresse") or item.get("address",""),
                    "website": item.get("SiteWeb") or item.get("website",""),
                    "desc": item.get("Description") or item.get("desc", desc_default)
                })
            print(f"✅ {len(entries)} {type_name} importés depuis URL")
            return entries
        except ValueError:
            print(f"⚠️ La réponse de {url} n'est pas un JSON valide")
            return []
    except requests.RequestException as e:
        print(f"⚠️ Impossible de récupérer {url} : {e}")
        return []

# -----------------------
# 4️⃣ Lecture des CSV locaux
# -----------------------
data.extend(read_csv(CSV_SOURCES["clubs"], "club", "Club d'athlétisme affilié à la FFA"))
data.extend(read_csv(CSV_SOURCES["events"], "event", "Événement running officiel"))
data.extend(read_csv(CSV_SOURCES["shops"], "shop", "Magasin spécialisé running"))

# -----------------------
# 5️⃣ Lecture des JSON distants
# -----------------------
for url in JSON_URLS:
    data.extend(read_json_url(url, "event", "Événement running officiel"))

# -----------------------
# 6️⃣ Suppression doublons
# -----------------------
unique_data = { (d["type"], d["name"], d["city"]): d for d in data }
data = list(unique_data.values())
print(f"✅ Total final : {len(data)} entrées uniques")

# -----------------------
# 7️⃣ Sauvegarde JSON
# -----------------------
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"🎉 {OUTPUT_FILE} généré avec succès !")
