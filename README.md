# Nayooscore

Plateforme SaaS multi-tenant de **score de finançabilité PME** pour institutions publiques, ONG, banques, incubateurs et fonds d'investissement.

## Stack

- **Frontend** : Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : InsForge (PostgreSQL, Auth, Storage, Edge Functions)
- **Déploiement** : Vercel
- **Versioning** : GitHub

## Démarrage local

```bash
npm install
cp .env.example .env.local
# Renseigner les variables InsForge dans .env.local
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  (auth)/          # Connexion, inscription
  (admin-saas)/    # Espace propriétaire plateforme
  (institution)/   # Espace institution partenaire
  (pme)/           # Espace entrepreneur
components/        # UI, layouts, dashboards, formulaires
lib/               # Client InsForge, auth, permissions, scoring
types/             # Types TypeScript métier
database/          # Schéma SQL, seeds, migrations
```

## Rôles

`SUPER_ADMIN` · `SAAS_MANAGER` · `INSTITUTION_ADMIN` · `INSTITUTION_ANALYST` · `PME_OWNER` · `PME_STAFF` · `VIEWER`

## Scripts

| Commande        | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Serveur de développement |
| `npm run build` | Build production         |
| `npm run start` | Démarrer en production   |
| `npm run lint`  | Vérification ESLint      |

## Licence

Propriétaire — Tous droits réservés.
