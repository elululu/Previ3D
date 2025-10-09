# Previ3D

Prévisionnel financier interactif pour les studios 3D.

## Configuration

1. Dupliquez le fichier `.env.example` en `.env` et remplissez les variables Firebase :

   ```bash
   cp .env.example .env
   ```

2. Renseignez les valeurs fournies par la console Firebase pour :
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID` (optionnel)

Les identifiants ne sont plus versionnés en clair dans le dépôt.

## Lancement

Installez les dépendances puis démarrez l'application (exemple avec Vite) :

```bash
npm install
npm run dev
```

## Fonctionnalités clés

- Gestion multi-onglets (Tableau de bord, Analyse, Tarification, Prestations, Charges, Réglages)
- Synchronisation temps réel avec Firestore
- Sélecteur de prévisionnels récents et partage via lien direct
- Validations des champs numériques et retours utilisateurs contextualisés
