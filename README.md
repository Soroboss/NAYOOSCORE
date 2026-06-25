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

## InsForge

Projet lié : `Nayooscore` (eu-central) — `https://idmq3ivb.eu-central.insforge.app`

```bash
# Lier le projet (si besoin)
npx @insforge/cli link

# Appliquer le schéma
npx @insforge/cli db import database/migrations/001_nayooscore_initial.sql

# Déployer les edge functions
npx @insforge/cli functions deploy calculate-company-score
npx @insforge/cli functions deploy create-audit-log
npx @insforge/cli functions deploy generate-company-report
npx @insforge/cli functions deploy generate-ai-recommendations
```

Variables requises dans `.env.local` — voir `.env.example`.


| Commande        | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Serveur de développement |
| `npm run build` | Build production         |
| `npm run start` | Démarrer en production   |
| `npm run lint`  | Vérification ESLint      |

## Licence

Propriétaire — Tous droits réservés.
