# ⚡ Express + Mongoose + TypeScript Module Generator

[![npm version](https://img.shields.io/npm/v/exp-cli-gen.svg)](https://www.npmjs.com/package/exp-cli-gen)
[![npm downloads](https://img.shields.io/npm/dw/exp-cli-gen.svg)](https://www.npmjs.com/package/exp-cli-gen)
[![npm total downloads](https://img.shields.io/npm/dt/exp-cli-gen.svg)](https://www.npmjs.com/package/exp-cli-gen)
[![GitHub stars](https://img.shields.io/github/stars/abumahid/mongo-server-stater-pack.svg)](https://github.com/abumahid/mongo-server-stater-pack/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/abumahid/mongo-server-stater-pack.svg)](https://github.com/abumahid/mongo-server-stater-pack/issues)
[![License](https://img.shields.io/github/license/abumahid/mongo-server-stater-pack.svg)](https://github.com/abumahid/mongo-server-stater-pack/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/abumahid/mongo-server-stater-pack.svg)](https://github.com/abumahid/mongo-server-stater-pack/commits/main)
[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## 🚀 Overview

**exp-cli-gen** is a powerful **Express + TypeScript module generator** that uses **Mongoose** for database interaction.  
It automatically creates a complete module structure — including **models, controllers, services, routes, Zod validations, and Swagger documentation** — all in one command.

Ideal for developers who want to quickly scaffold modular Express APIs with clean architecture and ready-to-use integrations.

---

## ✨ Features

- ⚙️ Generates full-featured Express + TypeScript modules  
- 🧩 Automatically integrates Mongoose models and Zod validations  
- 📘 Adds Swagger documentation automatically  
- 🚀 Clones and sets up a ready-to-run Express starter project  
- 🔁 Can add new modules anytime with a single command  
- 🧠 Skips redundant setup if the starter pack already exists  
- 💪 Built for scalability and maintainability

---

## 📦 Installation

Install globally:

```bash
npm install -g exp-cli-gen
```
Or run directly using npx (recommended):

```bash
npx exp-cli-gen <module-name>
```
## Usage
🏗️ Generate your first module

Run:

```bash
npx exp-cli-gen test
```
First run example:

```bash
Need to install the following packages:
exp-cli-gen@1.0.1
Ok to proceed? (y)

⠋ No Express project found. Cloning starter pack...
✔ Starter project cloned!

✔ Git logs removed!

📦 Installing dependencies...

🚀 Project setup complete.
🧩 Generating module: test...
✔ test.interface.ts created
✔ test.schema.ts created
✔ test.validation.ts created
✔ test.route.ts created
✔ test.controller.ts created
✔ test.service.ts created
✔ test.swagger.ts created

🔗 Route added to src/app/routes.ts
📘 Swagger doc added to src/swaggerOptions.ts
✨ Module 'test' created successfully!

```

## 📁 Generated Module Structure

Each generated module will contain the following files:

```pgsql
src/app/modules/<module-name>/
 ├── <module-name>.interface.ts
 ├── <module-name>.schema.ts
 ├── <module-name>.validation.ts
 ├── <module-name>.route.ts
 ├── <module-name>.controller.ts
 ├── <module-name>.service.ts
 └── <module-name>.swagger.ts
```

## 🔄 Add More Modules

Need another module? Just run:

```bash
npx exp-cli-gen products
```

If the starter project already exists, it will skip cloning and directly add the new module.

Example output:
```bash
ℹ 📦 Starter folder already exists. Skipping clone.
📦 Dependencies already installed. Skipping npm install.
🧩 Generating module: products...
✔ products files created
✨ Module 'products' created successfully!

src/app/modules/products/
 ├── products.interface.ts
 ├── products.schema.ts
 ├── products.validation.ts
 ├── products.route.ts
 ├── products.controller.ts
 ├── products.service.ts
 └── products.swagger.ts
```

Then, refresh your Swagger docs at:
```bash
http://localhost:5000/docs
```

You’ll see your new routes automatically added.

---

## ⚙️ Configuration

After setup, update your .env file following the .env.example file in the starter project.

To start the server:
```bash
npm run dev
```
Open Swagger documentation at:
```bash
http://localhost:5000/docs
```

---
## 🧠 Tech Stack

- Express.js — Backend framework
- TypeScript — Strongly typed JavaScript
- Mongoose — MongoDB ORM
- Zod — Runtime schema validation
- Swagger — API documentation
- CLI (Node.js) — Command-line automation

---
## 🧩 Starter Pack Repository

This CLI uses the following base project as a starter:

👉 [mongo-server-stater-pack](https://github.com/abumahid/mongo-server-stater-pack.git)

---
## 💬 Author

Abu Mahid

🧠 [GitHub Profile](https://github.com/abumahid)

💼 [npm Profile](https://www.npmjs.com/~dev_abumahid)

---
### ⭐ Star this project

If you like this CLI, please give it a ⭐ on GitHub — it helps others discover it too! Thank you!