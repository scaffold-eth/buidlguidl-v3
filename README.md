# BuidlGuidl v3 [![Netlify Status](https://api.netlify.com/api/v1/badges/8364bb50-487e-4f28-b83d-0ce3172352a6/deploy-status)](https://app.netlify.com/sites/nostalgic-lewin-237ec8/deploys)

The 🏰 BuidlGuidl is a curated group of Ethereum builders creating products, prototypes, and tutorials with 🏗 [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth)

---

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

Start the backend service:

```bash

yarn backend

```

In a new terminal, start the frontend:

```bash

yarn start

```

At this point, you should have the app available at <http://localhost:3000>.

## Builder / Admin role

If you want to have a builder or admin role, you can edit `packages/backend/local_database/local_db.json` (created after the first time you run `yarn backend`) and add your address:

```json
"<YOUR_ADDRESS>": {
  "creationTimestamp": 1633088553221,
  "role": "admin",
},
```

Remember to restart the backend & refresh the page.
