# FairScore — Fair Credit Intelligence

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6)
![Dataset](https://img.shields.io/badge/Dataset-UCI%20German%20Credit-purple)

**FairScore** is an open-source, end-to-end **Explainable and Bias-Aware Credit Scoring System**. Built as a Turborepo full-stack monorepo with a **FastAPI + scikit-learn/Fairlearn** backend and a **Next.js 14 + Tailwind CSS + Recharts** web application, FairScore demonstrates how credit risk assessment models can be simultaneously **accurate**, **transparent**, and **audited for demographic fairness**.

> **Educational & Research Prototype Disclaimer:** FairScore is an educational and research prototype evaluated on the public [UCI Statlog German Credit Data](https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data) dataset. It is not a production lending system and must not be used as the basis for real-world financial or credit decisions.

```text
[ DATA ] ──► [ PREDICT ] ──► [ EXPLAIN ] ──► [ AUDIT ] ──► [ MITIGATE ]
```

##  Key Features

- **Multi-Model Credit Scoring:** Evaluates applicants using **Logistic Regression**, **Random Forest (Baseline)**, and a **Fairness-Mitigated Random Forest**, returning `Good`/`Bad` credit risk, probability, a `0–100` score, and risk tier (`Low`, `Medium`, `High`).
- **Semantically Guarded Local Explainability:** Computes per-applicant feature contributions along tree decision paths, aggregates one-hot encoded columns back to the 20 raw features, suppresses non-monotonic polarity conflicts, and excludes protected attributes (`age`, `personal_status`, `foreign_worker`) from individual credit reasons.
- **Demographic Fairness Auditing:** Audits predictions across **Gender** (`Male` vs. `Female`) and **Age Group** (`<25` vs. `>=25`) using Selection Rate, TPR, FPR, Demographic Parity Difference, Disparate Impact Ratio, and Equal Opportunity Difference.
- **Bias Mitigation Comparison:** Uses sample reweighing to train a fairness-aware model and visualizes the accuracy–fairness trade-off alongside baseline models.
- **Interactive Liquid Glass Web UI:** Includes 7 Next.js pages (`Dashboard`, `Credit Prediction`, `Fairness Audit`, `Model Performance`, `Dataset`, `Prediction History`, and `About`) with Recharts visualizations and SQLite prediction logging.

##  Tech Stack

| Category | Technology | Badge & Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) |  | React framework & routing |
| **UI Library** | React & React DOM |  | Interactive component architecture |
| **Language (Web)** | TypeScript |  | Static typing across web & shared packages |
| **Styling** | Tailwind CSS |  | Utility styling & Liquid Glass design tokens |
| **Charts & Icons** | Recharts & Lucide React |   | ROC, Radar, Bar & Pie charts + icons |
| **Backend API** | FastAPI & Uvicorn |   | Async REST API & OpenAPI docs (`/docs`) |
| **Validation** | Pydantic |  | Request/response schema & cross-field validation |
| **Machine Learning** | scikit-learn & Joblib |   | Preprocessing pipeline, training & model persistence |
| **Fairness & Data** | Fairlearn, Pandas & NumPy |    | Fairness auditing, reweighing & tabular data |
| **Database** | SQLite |  | Local prediction history storage (`predictions.db`) |
| **Monorepo** | Turborepo & Concurrently |   | Workspace orchestration & dual dev server runner |

##  Project Structure

```text
fairscore/
├── apps/
│   ├── api/                        # FastAPI backend & ML pipeline
│   │   ├── app/
│   │   │   ├── core/config.py      # Paths & SQLite configuration
│   │   │   ├── routes/             # health, prediction, metrics, fairness, dataset, history
│   │   │   ├── schemas/            # Pydantic v2 request/response schemas
│   │   │   ├── services/           # ModelService & ExplainabilityService
│   │   │   └── main.py             # FastAPI app entrypoint
│   │   ├── ml/train.py             # Preprocessing, training & evaluation pipeline
│   │   ├── tests/                  # Explainability & schema validation unit tests
│   │   └── requirements.txt        # Python dependencies
│   └── web/                        # Next.js 14 frontend application
│       ├── app/                    # dashboard, predict, fairness, model, dataset, history, about
│       ├── components/             # Sidebar, AppHeader, MobileNavigation & Liquid Glass UI
│       └── lib/api.ts              # Typed REST API client
├── packages/
│   ├── types/                      # Shared TypeScript interfaces (@fairscore/types)
│   └── ui/                         # Shared React UI components (@fairscore/ui)
├── data/                           # Raw & processed UCI German Credit CSV datasets
├── models/                         # Saved .joblib models, feature_names.json & metrics.json
├── start-fairscore.bat             # One-click Windows startup script
├── start-fairscore.sh              # One-click Mac startup script
├── turbo.json                      # Turborepo task configuration
└── package.json                    # Root workspace scripts & dependencies
```

##  Model Performance Summary

Evaluated on an **80/20 stratified split** (`800` train / `200` test, `seed = 42`) of the **UCI Statlog German Credit Data** (`700` Good / `300` Bad credit records):

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 71.5% | 77.9% | 82.9% | 80.3% | 75.3% |
| **Random Forest (Baseline)** | **73.0%** | 75.6% | **90.7%** | **82.5%** | 75.9% |
| **Fairness-Mitigated Model** | 66.0% | **83.3%** | 64.3% | 72.6% | **77.1%** |

## Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0` and **npm** `>= 9.0.0`
- **Python** `>= 3.10` (with `venv` and `pip`)

### Option 1: Quick Start (Local Development)

#### 1. Clone the repository and install Node workspace dependencies

```bash
git clone https://github.com/your-username/fairscore.git
cd fairscore
npm install
```

#### 2. Set up the Python virtual environment and install backend packages

**On macOS / Linux:**

```bash
python3 -m venv apps/api/.venv
apps/api/.venv/bin/pip install -r apps/api/requirements.txt
```

**On Windows (Command Prompt / PowerShell):**

```cmd
npm install
npm run setup
```

#### 3. Start both the FastAPI Backend and Next.js Frontend

**On macOS / Linux:**

```bash
./start-fairscore.sh
```

**On Windows:**

```cmd
start-fairscore.bat
```

*(Alternatively, run `npm run dev` on Windows or `make dev` on macOS/Linux).*

Once running, open:
- **Web Application:** `http://localhost:3000`
- **FastAPI Backend:** `http://localhost:8000`
- **Interactive Swagger API Docs:** `http://localhost:8000/docs`

### Option 2: Run with Docker Compose

You can launch the entire stack in isolated containers without installing local Python or Node toolchains:

```bash
docker compose up --build
```

## Retraining Models & Running Tests

### Retrain the ML Pipeline

Pre-trained model artifacts are included in `models/` out of the box. To re-run preprocessing, model training, fairness mitigation, and metric generation from `data/raw/german_credit.csv`:

```bash
# macOS / Linux
apps/api/.venv/bin/python -m ml.train --cwd apps/api
# Or from apps/api directory:
cd apps/api && .venv/bin/python -m ml.train

# Windows
npm run train
```

### Run Backend Unit & Explainability Guardrail Tests

The test suite in `apps/api/tests/test_explainability.py` verifies semantic polarity conflict suppression, protected attribute exclusion, feature importance aggregation across all 20 raw features, and Pydantic sex/marital-status cross-validation:

```bash
cd apps/api
.venv/bin/python -m unittest discover -s tests -v
```

### Run Frontend Linting & Production Build

```bash
npm run lint
npm run build
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | Service health status and loaded model names |
| `POST` | `/api/predict` | Predict credit risk with local explanations and fairness context |
| `POST` | `/api/predict-with-fairness` | Compare Baseline Random Forest vs. Fair Model predictions |
| `GET` | `/api/metrics` | Model metrics, confusion matrices, and ROC curves |
| `GET` | `/api/model-info` | Model types, hyperparameters, and feature names |
| `GET` | `/api/fairness` | Group fairness metrics across Gender and Age |
| `GET` | `/api/fairness/comparison` | Baseline vs. Fair Model accuracy–fairness trade-off |
| `GET` | `/api/dataset` | Dataset record counts and feature distributions |
| `GET/POST/DELETE` | `/api/history` | Fetch, add, or clear SQLite prediction history |

## ⚠️ Disclaimer

FairScore is an **educational and research prototype** evaluated on a public dataset. It is **not a production lending system** and must not be used for real-world financial decisions.

## 📄 License

This project is open source and available under the **MIT License**.
