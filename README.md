# pricingrl — Dynamic Pricing via Reinforcement Learning

> Wikolabs AI Platform · GCP Cloud Run GPU · Next.js 14 + FastAPI · PPO Agent

---

## Table of Contents

1. [Vision produit](#1-vision-produit)
2. [User Stories](#2-user-stories)
3. [Business Rules](#3-business-rules)
4. [Architecture Overview](#4-architecture-overview)
5. [Mono-repo Structure](#5-mono-repo-structure)
6. [RL Environment Specification](#6-rl-environment-specification)
7. [UML Diagrams](#7-uml-diagrams)
8. [API Reference](#8-api-reference)
9. [UI Simulation Guide](#9-ui-simulation-guide)
10. [Database Schema](#10-database-schema)
11. [Infrastructure & Deployment](#11-infrastructure--deployment)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Kaggle Dataset](#13-kaggle-dataset)
14. [Local Development](#14-local-development)

---

## 1. Vision produit

### Problème métier

Les opérateurs e-commerce et de marketplace laissent **10 à 30 % de chiffre d'affaires** sur la table en appliquant des règles de prix fixes ou des ladders statiques. Ces approches ignorent :

- La dynamique de la demande en temps réel (heure, jour, météo, événements)
- Les réactions concurrentielles non linéaires
- Les coûts d'opportunité liés aux ruptures de stock vs surstockage
- Les interactions complexes entre élasticité-prix et segmentation client

### Solution

**pricingrl** entraîne un agent de Reinforcement Learning (algorithme PPO — Proximal Policy Optimization) dans un environnement de simulation de marché. L'agent apprend une politique de tarification optimale qui maximise les revenus tout en maintenant les volumes — sans règles codées en dur.

### Proposition de valeur

| Approche actuelle | pricingrl |
|---|---|
| Règles manuelles figées | Politique adaptative apprise par l'expérience |
| Réaction lente aux signaux marché | Ajustement en temps réel sous la seconde en inférence |
| Optimisation mono-objectif marge | Multi-objectif : revenu + volume + coût de stockage |
| Pas de modélisation concurrentielle | Réaction Nash intégrée dans la simulation |
| A/B testing long et coûteux | Simulation 30 jours en quelques minutes |

### Cas d'usage cibles

- Retailers en ligne (mode, électronique, alimentation)
- Marketplaces multi-vendeurs
- Hôtellerie et yield management
- Compagnies aériennes (tarification dynamique des sièges)
- SaaS pricing (freemium → upgrade triggers)

---

## 2. User Stories

### Rôles

- **Pricing Manager** : responsable des stratégies de prix, non-technique
- **Data Scientist** : configure et entraîne les agents RL
- **DevOps** : déploie et monitore l'infrastructure
- **CEO / Directeur Commercial** : suit les KPIs revenus

### Epic 1 — Simulation environnement

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-001 | Pricing Manager | configurer les paramètres d'élasticité via des sliders | simuler mon marché sans coder |
| US-002 | Pricing Manager | visualiser la courbe demande/prix en temps réel | comprendre l'impact d'un changement de prix |
| US-003 | Data Scientist | définir l'espace d'état (inventaire, signal demande, prix concurrent) | créer un environnement de simulation réaliste |
| US-004 | Data Scientist | importer des données historiques de prix/volume | initialiser la simulation avec des données réelles |

### Epic 2 — Entraînement de l'agent RL

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-005 | Data Scientist | lancer un job d'entraînement PPO en un clic | démarrer l'apprentissage sans configuration manuelle |
| US-006 | Data Scientist | suivre les courbes de récompense en temps réel | détecter la convergence ou les instabilités |
| US-007 | Data Scientist | configurer les hyperparamètres learning rate batch size n_steps | optimiser la performance de l'agent |
| US-008 | Data Scientist | sauvegarder et versionner les checkpoints de politique | revenir à une version antérieure si nécessaire |

### Epic 3 — Évaluation & A/B Testing

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-009 | Pricing Manager | comparer la politique RL vs règles fixes sur 30 jours simulés | valider le gain avant déploiement |
| US-010 | CEO | voir le delta de revenu projeté RL vs baseline | prendre une décision d'adoption |
| US-011 | Data Scientist | analyser l'explicabilité : quelles variables poussent le prix à la hausse/baisse | auditer la politique apprise |

### Epic 4 — Déploiement & Monitoring

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| US-012 | DevOps | déployer le modèle sur Cloud Run GPU en un pipeline automatisé | mettre à jour sans interruption de service |
| US-013 | Pricing Manager | activer/désactiver l'agent RL en production via un toggle | garder le contrôle humain sur la tarification |
| US-014 | Pricing Manager | recevoir des alertes si le prix sort des bornes configurées | assurer la protection des marges |

---

## 3. Business Rules

### BR-001 — Espace d'état de l'agent RL

```
state = [
  current_price,       # prix actuel normalisé [0, 1]
  inventory_level,     # niveau de stock [0, 1]
  demand_signal,       # signal demande temps réel [0, 1]
  competitor_price,    # prix concurrent normalisé [0, 1]
  day_of_week,         # encodage cyclique [sin, cos]
  hour_of_day          # encodage cyclique [sin, cos]
]
```

### BR-002 — Espace d'action discrétisé

| Action | Ajustement de prix |
|---|---|
| 0 | -10% du prix actuel |
| 1 | -5% du prix actuel |
| 2 | 0% maintien |
| 3 | +5% du prix actuel |
| 4 | +10% du prix actuel |

### BR-003 — Fonction de récompense

```
reward = revenue - stockout_penalty - overstock_penalty
revenue           = price x units_sold
stockout_penalty  = -50 x units_lost_demand
overstock_penalty = -0.5 x excess_units x days
```

### BR-004 — Simulation de la demande élasticité-prix

```
demand = base_demand x (price / reference_price)^(-elasticity)
elasticity in [0.5, 3.0]
  0.5 = demande peu sensible au prix (luxe, biens essentiels)
  3.0 = demande très élastique (produits banalisés)
```

### BR-005 — Réaction concurrentielle réponse Nash

```
if our_price_drop > 5%:
    competitor_price -= 3%   # réaction défensive
if our_price_increase > 10%:
    competitor_price unchanged
```

### BR-006 — Saisonnalité

Multiplicateurs horaires : 12h-14h (+40%), 18h-20h (+30%), 2h-5h (-50%).
Multiplicateurs journaliers : Samedi (+25%), Dimanche (+20%), Lundi (-15%).

### BR-007 — Contraintes de prix

```
min_price = unit_cost x 1.10        # protection de marge minimale 10%
max_price = reference_price x 1.50  # plafond a +50% du prix de référence
```

### BR-008 — A/B Testing

Durée de fenêtre : 30 jours simulés. Groupe A : politique RL. Groupe B : règle fixe.
Métriques : revenu total, volume vendu, nombre de ruptures, marge nette.

### BR-009 — Suivi de convergence

Courbe de récompense rolling-100 épisodes. Entropie < 0.1 → politique saturée.
Coefficient de variation < 5% sur 500 épisodes → convergé.

### BR-010 — Explicabilité de la politique

SHAP values sur décisions de l'agent. Heatmap inventory_level x demand_signal → action.
Export CSV pour audit compliance.

---

## 4. Architecture Overview

```
Browser / Client
Next.js 14 · TypeScript · Tailwind · Recharts
        |
        | HTTPS / WebSocket
        v
FastAPI Backend (Python 3.11)
/api/env  /api/train  /api/policy  /api/simulate
Stable-Baselines3 (PPO) · Gymnasium · pandas · numpy
        |                           |
        v                           v
PostgreSQL                    GCP Cloud Run GPU
Pricing History               Training (A100 / L4)
A/B Logs                      PPO Jobs → GCS Checkpoints
```

---

## 5. Mono-repo Structure

```
pricingrl/
├── frontend/                          # Next.js 14
│   ├── src/app/
│   │   ├── page.tsx                   # Dashboard pricing
│   │   ├── simulation/page.tsx        # Playground élasticité
│   │   ├── training/page.tsx          # Courbes de récompense RL
│   │   └── ab-test/page.tsx           # Comparaison A/B
│   ├── src/components/
│   │   ├── DemandCurveChart.tsx       # Recharts courbe demande/prix
│   │   ├── RewardChart.tsx            # Episode reward rolling avg
│   │   ├── PricingPlayground.tsx      # Sliders élasticité
│   │   ├── PolicyHeatmap.tsx          # Heatmap action recommandée
│   │   └── ABTestDashboard.tsx        # KPIs RL vs baseline
│   └── src/hooks/
│       ├── useSimulation.ts
│       └── useTrainingStream.ts       # WebSocket live rewards
│
├── backend/                           # FastAPI
│   └── app/
│       ├── main.py
│       ├── api/
│       │   ├── environment.py         # Gymnasium env endpoints
│       │   ├── training.py            # PPO training jobs
│       │   ├── policy.py              # Policy inference
│       │   ├── simulation.py          # Demand simulation
│       │   └── ab_test.py             # A/B experiment management
│       └── rl/
│           ├── pricing_env.py         # Gymnasium PricingEnv
│           ├── ppo_trainer.py         # SB3 PPO wrapper
│           ├── reward.py              # Reward function
│           └── demand_model.py        # Elasticity simulation
│
├── .github/workflows/
│   ├── ci.yml
│   └── deploy-cloud-run.yml
├── cloudbuild.yaml
├── docker-compose.yml
└── README.md
```

---

## 6. RL Environment Specification

### PricingEnv — Gymnasium

```python
class PricingEnv(gym.Env):
    """
    Observation space: Box(6,) — état normalisé [0, 1]
    Action space: Discrete(5) — [-10%, -5%, 0%, +5%, +10%]
    """
    def __init__(self, config: EnvConfig):
        super().__init__()
        self.observation_space = spaces.Box(low=0.0, high=1.0, shape=(6,), dtype=np.float32)
        self.action_space = spaces.Discrete(5)
        self.price_adjustments = [-0.10, -0.05, 0.00, 0.05, 0.10]

    def step(self, action: int):
        adjustment = self.price_adjustments[action]
        new_price = np.clip(self.current_price * (1 + adjustment),
                            self.config.min_price, self.config.max_price)
        demand = self._compute_demand(new_price)
        units_sold = min(demand, self.inventory)
        revenue = new_price * units_sold
        stockout_penalty = 50 * max(0, demand - self.inventory)
        overstock_penalty = 0.5 * max(0, self.inventory - units_sold)
        reward = revenue - stockout_penalty - overstock_penalty
        self._update_competitor(new_price)
        self._advance_time()
        return self._get_obs(), reward, self._is_done(), False, {}
```

### PPO Hyperparamètres recommandés

| Paramètre | Valeur |
|---|---|
| learning_rate | 3.0e-4 |
| n_steps | 2048 |
| batch_size | 64 |
| n_epochs | 10 |
| gamma | 0.99 |
| gae_lambda | 0.95 |
| clip_range | 0.2 |
| ent_coef | 0.01 |
| total_timesteps | 1 000 000 |

---

## 7. UML Diagrams

### 7.1 RL Environment Loop

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e40af', 'tertiaryColor': '#0f172a'}}}%%
flowchart TD
    classDef agent fill:#1d4ed8,stroke:#3b82f6,color:#fff
    classDef env fill:#065f46,stroke:#10b981,color:#fff
    classDef reward fill:#7c2d12,stroke:#f97316,color:#fff
    classDef store fill:#4a1d96,stroke:#a78bfa,color:#fff

    A([PPO Agent]):::agent -->|action Discrete 0-4| B[PricingEnv.step]:::env
    B --> C[Compute new_price]:::env
    C --> D[Demand simulation\nelasticity model]:::env
    D --> E[units_sold = min demand inventory]:::env
    E --> F[revenue = price x units_sold]:::reward
    F --> G[stockout_penalty -50 x lost_demand]:::reward
    G --> H[overstock_penalty -0.5 x excess x days]:::reward
    H --> I([reward = revenue - penalties]):::reward
    I --> J[Update state\ncompetitor reaction\nseasonality]:::env
    J --> K{Episode done?}
    K -->|No| A
    K -->|Yes| L[Log episode stats]:::store
    L --> M[(PostgreSQL\nexperiment_logs)]:::store
    M --> A
```

### 7.2 State Machine — Pricing Agent Lifecycle

```mermaid
%%{init: {'theme': 'dark'}}%%
stateDiagram-v2
    [*] --> Idle
    Idle --> Configuring : user opens simulation
    Configuring --> Training : launch PPO job
    Training --> Evaluating : total_timesteps reached
    Training --> Training : checkpoint every 10k steps
    Evaluating --> ABTesting : eval metrics acceptable
    Evaluating --> Configuring : below threshold retune
    ABTesting --> Deploying : RL wins A/B p < 0.05
    ABTesting --> Idle : no significant improvement
    Deploying --> Production : Cloud Run deployed
    Production --> Monitoring : live inference active
    Monitoring --> Idle : agent disabled by user
    Monitoring --> Training : drift detected retrain
```

### 7.3 System Architecture Diagram

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'lineColor': '#3b82f6'}}}%%
graph LR
    classDef fe fill:#1e3a5f,stroke:#3b82f6,color:#fff
    classDef be fill:#14532d,stroke:#22c55e,color:#fff
    classDef infra fill:#3b0764,stroke:#a855f7,color:#fff
    classDef data fill:#7c2d12,stroke:#f97316,color:#fff

    Browser["Browser Next.js 14"]:::fe
    API["FastAPI Python 3.11"]:::be
    PPO["PPO Trainer SB3"]:::be
    Gym["PricingEnv Gymnasium"]:::be
    PG[("PostgreSQL")]:::data
    CloudRun["GCP Cloud Run GPU"]:::infra
    GCS["GCS Checkpoints"]:::infra

    Browser -- REST/WebSocket --> API
    API --> PPO
    PPO --> Gym
    API --> PG
    PPO --> CloudRun
    CloudRun --> GCS
    GCS --> API
```

### 7.4 Entity-Relationship Diagram

```mermaid
%%{init: {'theme': 'dark'}}%%
erDiagram
    EXPERIMENT {
        uuid id PK
        string name
        string status
        jsonb env_config
        jsonb ppo_config
        timestamp created_at
        timestamp completed_at
    }
    EPISODE {
        uuid id PK
        uuid experiment_id FK
        int episode_number
        float total_reward
        float total_revenue
        int stockout_count
        timestamp recorded_at
    }
    PRICING_RECORD {
        uuid id PK
        uuid experiment_id FK
        timestamp ts
        float price
        float units_sold
        float revenue
        int action_taken
        float inventory_level
    }
    AB_TEST {
        uuid id PK
        uuid experiment_rl_id FK
        string baseline_strategy
        int window_days
        float revenue_rl
        float revenue_baseline
        float p_value
        boolean rl_wins
    }
    POLICY_VERSION {
        uuid id PK
        uuid experiment_id FK
        int version
        string gcs_path
        float eval_reward
        timestamp saved_at
    }

    EXPERIMENT ||--o{ EPISODE : produces
    EXPERIMENT ||--o{ PRICING_RECORD : logs
    EXPERIMENT ||--o{ POLICY_VERSION : saves
    EXPERIMENT ||--o| AB_TEST : tested_in
```

---

## 8. API Reference

### Base URL : `https://api.pricingrl.wikolabs.com/v1`

#### POST /env/configure

```json
{
  "base_demand": 100,
  "reference_price": 10.00,
  "unit_cost": 4.50,
  "elasticity": 1.8,
  "initial_inventory": 500,
  "episode_length_days": 30
}
```

Response 200:
```json
{
  "env_id": "env_7f3a1c",
  "min_price": 4.95,
  "max_price": 15.00,
  "observation_space": [6],
  "action_space": 5
}
```

#### POST /training/start

```json
{
  "env_id": "env_7f3a1c",
  "total_timesteps": 1000000,
  "learning_rate": 3e-4,
  "n_steps": 2048,
  "batch_size": 64,
  "n_epochs": 10
}
```

Response 202:
```json
{
  "job_id": "job_a4e2f9",
  "status": "queued",
  "estimated_minutes": 12,
  "cloud_run_job": "pricingrl-train-a4e2f9"
}
```

#### GET /training/{job_id}/stream

Server-Sent Events stream:
```
data: {"episode": 100, "reward_mean": 142.3, "reward_std": 28.1, "entropy": 1.42}
data: {"episode": 200, "reward_mean": 189.7, "reward_std": 19.4, "entropy": 1.21}
```

#### POST /policy/infer

```json
{
  "policy_version_id": "v3",
  "state": {
    "current_price": 9.50,
    "inventory_level": 0.7,
    "demand_signal": 0.85,
    "competitor_price": 9.20,
    "day_of_week": 5,
    "hour_of_day": 13
  }
}
```

Response 200:
```json
{
  "action": 3,
  "price_adjustment": "+5%",
  "recommended_price": 9.975,
  "confidence": 0.87,
  "shap_values": {
    "demand_signal": 0.42,
    "competitor_price": 0.28,
    "inventory_level": 0.15,
    "hour_of_day": 0.10,
    "day_of_week": 0.04,
    "current_price": 0.01
  }
}
```

#### POST /simulate/demand

```json
{
  "base_demand": 100,
  "reference_price": 10.00,
  "elasticity": 1.8,
  "price_range": [5.0, 20.0],
  "steps": 30
}
```

Response 200:
```json
{
  "curve": [
    {"price": 5.0, "demand": 215.4, "revenue": 1077.0},
    {"price": 6.0, "demand": 172.6, "revenue": 1035.6}
  ],
  "optimal_price": 9.50,
  "max_revenue": 1386.2
}
```

#### POST /ab-test/create

```json
{
  "policy_version_id": "v3",
  "baseline_strategy": "fixed_price",
  "baseline_price": 9.99,
  "window_days": 30
}
```

---

## 9. UI Simulation Guide

### Écran 1 — Pricing Playground

Objectif : simuler l'impact de l'élasticité-prix sans entraîner d'agent RL.

- Slider Élasticité [0.5 → 3.0] → recalcule la courbe de demande en temps réel
- Slider Prix actuel [min_price → max_price]
- Recharts LineChart : axe X = prix, axe Y = demande ET revenu
- Prix optimal (max revenu) annoté avec une ligne verticale
- Slider Signal demande [0.5 → 1.5] → simule pic ou creux

### Écran 2 — RL Training Dashboard

Objectif : suivre l'entraînement de l'agent PPO en temps réel.

- LineChart : épisode vs récompense moyenne rolling-100
- Badge statut : QUEUED / TRAINING / CONVERGED / FAILED
- Métriques live : steps/sec, entropie politique, loss valeur, loss politique
- Bouton Stop Training + Save Checkpoint
- AreaChart : distribution des récompenses par épisode

### Écran 3 — A/B Test Comparaison

Objectif : comparer politique RL vs règle fixe sur 30 jours simulés.

- BarChart : revenus journaliers RL (bleu) vs baseline (gris)
- KPIs : delta revenu total, delta volume, delta marge, ruptures
- p-value badge : significativité statistique
- Timeline : décisions de prix agent vs prix fixe

### Écran 4 — Policy Explainability

Objectif : comprendre quelles variables orientent les décisions.

- Heatmap : inventory_level x demand_signal → action recommandée
- Bar chart SHAP : feature importance par décision
- Export CSV pour audit compliance

---

## 10. Database Schema

```sql
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    env_config JSONB NOT NULL,
    ppo_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id),
    episode_number INTEGER NOT NULL,
    total_reward FLOAT,
    steps INTEGER,
    avg_price FLOAT,
    total_revenue FLOAT,
    stockout_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id),
    ts TIMESTAMPTZ DEFAULT NOW(),
    price FLOAT NOT NULL,
    demand FLOAT,
    units_sold FLOAT,
    revenue FLOAT,
    action_taken INTEGER,
    competitor_price FLOAT,
    inventory_level FLOAT
);

CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_rl_id UUID REFERENCES experiments(id),
    baseline_strategy VARCHAR(100),
    window_days INTEGER DEFAULT 30,
    revenue_rl FLOAT,
    revenue_baseline FLOAT,
    p_value FLOAT,
    rl_wins BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id),
    version INTEGER NOT NULL,
    gcs_path VARCHAR(500),
    eval_reward FLOAT,
    saved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_episodes_experiment ON episodes(experiment_id, episode_number);
CREATE INDEX idx_pricing_records_experiment ON pricing_records(experiment_id, ts);
```

---

## 11. Infrastructure & Deployment

### cloudbuild.yaml — GCP Cloud Run GPU

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/pricingrl-backend:$SHORT_SHA', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/pricingrl-backend:$SHORT_SHA']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - run
      - deploy
      - pricingrl-backend
      - '--image=gcr.io/$PROJECT_ID/pricingrl-backend:$SHORT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
      - '--gpu=1'
      - '--gpu-type=nvidia-l4'
      - '--memory=16Gi'
      - '--cpu=4'
      - '--timeout=3600'
      - '--no-allow-unauthenticated'
```

### Backend Dockerfile

```dockerfile
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### docker-compose.yml

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    ports: ["8000:8080"]
    environment:
      - DATABASE_URL=postgresql://pricingrl:pricingrl@db:5432/pricingrl
    depends_on: [db]
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: pricingrl
      POSTGRES_PASSWORD: pricingrl
      POSTGRES_DB: pricingrl
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

### requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.30.0
stable-baselines3==2.3.0
gymnasium==0.29.1
torch==2.2.0
pandas==2.2.2
numpy==1.26.4
sqlalchemy==2.0.30
asyncpg==0.29.0
psycopg2-binary==2.9.9
alembic==1.13.1
pydantic==2.7.1
shap==0.45.0
scipy==1.13.0
```

---

## 12. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI pricingrl

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: pricingrl_test
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.11'}
      - run: pip install -r backend/requirements.txt
      - run: pip install pytest pytest-asyncio httpx
      - run: pytest backend/tests/ -v
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/pricingrl_test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: '20'}
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud builds submit --config cloudbuild.yaml
```

---

## 13. Kaggle Dataset

**Dataset : avocado-prices**

| Attribut | Valeur |
|---|---|
| Source | Hass Avocado Board via Kaggle |
| Lignes | 18 249 observations hebdomadaires 2015-2018 |
| Colonnes | Date, AveragePrice, TotalVolume, PLU codes, bags, type, year, region |
| Régions | 54 marchés régionaux US + agrégats nationaux |

**Usage dans pricingrl :**
- Initialisation base_demand et reference_price par région
- Estimation des élasticités empiriques via régression log-log prix/volume
- Calibration des multiplicateurs de saisonnalité hebdomadaire
- Validation de l'environnement de simulation

**Téléchargement :**
```bash
pip install kaggle
kaggle datasets download -d neuromusic/avocado-prices
unzip avocado-prices.zip -d backend/data/raw/
```

---

## 14. Local Development

### Prérequis

- Python 3.11+, Node.js 20+, Docker & Docker Compose

### Installation rapide

```bash
git clone https://github.com/Wikolabs/pricingrl.git
cd pricingrl

# Via Docker Compose (recommandé)
docker compose up --build

# Backend seul
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend seul
cd frontend && npm install && npm run dev
```

### Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@localhost:5432/pricingrl |
| GCS_BUCKET | Bucket GCS checkpoints | pricingrl-checkpoints |
| GCP_PROJECT_ID | ID projet GCP | wikolabs-prod |
| CLOUD_RUN_REGION | Région Cloud Run | us-central1 |
| SECRET_KEY | Clé JWT API | changeme-in-prod |
| WANDB_API_KEY | Weights and Biases tracking | optionnel |

---

*Wikolabs — pricingrl · Dynamic Pricing via Reinforcement Learning · v1.0.0*
