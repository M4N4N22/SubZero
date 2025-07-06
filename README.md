# ❄️ SubZero — Autonomous Web3 Subscription Protocol on Massa Blockchain

**SubZero** is an **autonomous recurring payments protocol** built on the **Massa blockchain**, enabling creators and dApps to define **self-executing subscription plans** without requiring manual renewals or Web2 intermediaries.

> 🚀 Built for WaveHack · Powered by Massa + Bearby Wallet

---

## ⚡ Why SubZero?

- 🔁 **Truly Recurring**: No need for reminders or approvals — payments just happen on-chain.
- 🧾 **Plan-as-a-Contract**: Every plan is securely tracked and stored on-chain.
- 👥 **Creator-first**: Creators deploy subscription plans with pricing, frequency, and accepted tokens.
- 🔐 **No Custody, No Risk**: User funds are never held by third parties.

---

## 🔗 Live Demo

👉 [https://subzero-app.vercel.app/](https://subzero-app.vercel.app)\
🎥 [Demo Coming Soon]

---

## 🛠️ Tech Stack

| Layer        | Tech                              |
| ------------ | --------------------------------- |
| Smart Layer  | Massa AssemblyScript (SDK)        |
| Wallet/Web3  | Bearby Wallet + @hicaru/bearby.js |
| Frontend     | Next.js 14 + App Router           |
| UI Framework | ShadCN + TailwindCSS              |
| Dev Tools    | `massa-sc-runtime` + `asbuild`    |
| Storage      | Massa SC Persistent Storage       |

---

## 🧠 How It Works

1. **Creator logs in** using Bearby wallet.
2. **Creator creates plan** with:
   - Plan ID (UUID)
   - Name, Description
   - Token accepted, Amount, Frequency (e.g. monthly)
3. Plan is stored via Massa SC Storage.
4. **Subscriber connects wallet** → subscribes to the plan.
5. **Protocol automatically triggers payment** at each interval.
6. Revenue is routed to the creator’s address.

---

## 🧩 Smart Contract Overview

- `createPlan(planId, name, token, amount, freq, createdAt)`
- `getPlansByCreator(creatorAddress)`
- `subscribeToPlan(planId)` *(coming soon)*
- `charge(planId)` *(executed automatically or by keeper)*

Stored as:

```ts
// Stored per plan
Storage.set("plan:" + planId, JSON.stringify({ ... }))

// Creator registry
Storage.set("creatorPlan:{creator}:{index}", planId)
Storage.set("creatorPlanCount:{creator}", count)
```

---

## 📂 Project Structure

```
subzero/
├── app/                     # Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Reusable UI
│   └── creator/
├── lib/
│   └── massa/              # massa & bearby interaction
│       ├── callCreatePlan.ts
│       └── getCreatorPlans.ts
├── contracts/
│   └── main.ts             # Massa AssemblyScript contract
├── public/
├── scripts/
├── README.md
└── package.json
```

---

## ⚙️ Massa Integration

### Bearby Contract Call:

```ts
import { web3 } from "@hicaru/bearby.js";
import { Args } from "@massalabs/massa-web3";

const args = new Args()
  .addString(planId)
  .addString(planName)
  .addString(token)
  .addString(amount)
  .addString(frequency)
  .addString(createdAt);

const txHash = await web3.contract.call({
  fee: 10_000_000,
  maxGas: 100_000_000,
  coins: 0,
  targetAddress: "<DeployedContractAddress>",
  functionName: "createPlan",
  unsafeParameters: args.serialize()
});
```

---

### Run Locally

```bash
# 1. Clone and install
pnpm install

# 2. Connect Bearby wallet in browser

# 3. Deploy contract using Station or manually with Massa CLI

# 4. Start frontend
pnpm dev
```

---

## 📦 Smart Contract: main.ts

```ts
export function createPlan(...) {
  const creator = Context.caller().toString();

  Storage.set("plan:" + planId, planJson);

  const countKey = "creatorPlanCount:" + creator;
  const indexKey = "creatorPlan:" + creator + ":" + count;

  Storage.set(indexKey, planId);
  Storage.set(countKey, (count + 1).toString());

  generateEvent("PlanCreated:" + planId);
}
```

---

## 🌱 Future Improvements

- Subscriber-side dashboard
- Auto-charging mechanism via keepers
- Token gating and NFT perks
- Refund and cancel logic
- Marketplace of top creators

---

## 👨‍💻 Author

- Name: Manan
- Role: Fullstack + Smart Contract Dev
- Project: Built for WaveHack · Phase 2
- Stack: Massa + Bearby + Next.js
