# BuidlGuidl v3 [![Netlify Status](https://api.netlify.com/api/v1/badges/8364bb50-487e-4f28-b83d-0ce3172352a6/deploy-status)](https://app.netlify.com/sites/nostalgic-lewin-237ec8/deploys)

The 🏰 BuidlGuidl is a curated group of Ethereum builders creating products, prototypes, and tutorials with 🏗 [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth)

---

## Prerequisites

[Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/).

If you want to connect to a **local** firebase instance:
  - Install the [firebase CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli)
  - Copy `packages/backend/.env.sample` to `packages/backend/.env`
  - Seed the local firebase: You can copy `packages/backend/local_database/seed.sample.json` to `packages/backend/local_database/seed.json` and tweak it as you need.

If you want to connect to your **live** firebase instance:
 - Donwload the `serviceAccountKey.json` file from the Firebase UI
 - Copy `packages/backend/.env.sample` to `packages/backend/.env`
 - Comment out the `FIRESTORE_EMULATOR_HOST` env var.
 - Set `GOOGLE_APPLICATION_CREDENTIALS` to the correct path to your `serviceAccountKey.json`


## Project setup

Get the project code:

```bash
git clone https://github.com/scaffold-eth/buidlguidl-v3

cd buidlguidl-v3
```

Install dependencies:

```bash

yarn install

```

(Optional) Start the firebase emulators 
```bash

firebase emulators:start

```

Start the backend service:

```bash

yarn backend

```

In a new terminal, start the frontend:

```bash

yarn start

```

At this point, you should have the app available at <http://localhost:3000>.
