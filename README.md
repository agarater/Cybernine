Readme v1.0

#Cybernine (C9) — README (ES)
Descripción

Cybernine (C9) es un MVP de PWA mobile-first para control de inventario en almacenes de barrio: Productos, Movimientos IN/OUT, alertas de reposición, Kardex y autenticación/roles. Incluye escaneo con cámara y fallback de ingreso manual.

Tecnologías

React (PWA) · Node.js (API REST) · PostgreSQL · ORM/migraciones (Prisma/Knex).

Requisitos

Node.js LTS · PostgreSQL 14+ · Git.
HTTPS para uso de cámara en demo/producción.

Inicio rápido
git clone <URL_REPO>
cd <CARPETA>
cp .env.example .env        # Completar DATABASE_URL, JWT_SECRET, etc.
npm install
npm run migrate             # Crea/actualiza esquema
npm run seed                # Carga dataset de ejemplo
npm run dev                 # Inicia API + frontend


Abrir http://localhost:3000. Credenciales de demo: ver seed/.env.

Pruebas mínimas

401/403 (auth y permisos) · OUT sin saldo negativo · escáner con fallback manual.

Alcance del MVP

Sin multi-tenant, contabilidad ni integraciones con proveedores. Offline básico (app shell).

Autor y uso

Ariel Gárate — proyecto académico. Licencia a definir.

Cybernine (C9) — README (EN)
Overview

Cybernine (C9) is a mobile-first PWA MVP for inventory control in neighborhood stores: Products, IN/OUT Movements, replenishment alerts, Kardex, and auth/roles. Supports camera barcode scanning with manual fallback.

Tech

React (PWA) · Node.js (REST API) · PostgreSQL · ORM/migrations (Prisma/Knex).

Prerequisites

Node.js LTS · PostgreSQL 14+ · Git.
HTTPS required for camera in demo/production.

Quick start
git clone <REPO_URL>
cd <FOLDER>
cp .env.example .env        # Fill DATABASE_URL, JWT_SECRET, etc.
npm install
npm run migrate             # Create/update schema
npm run seed                # Load sample dataset
npm run dev                 # Start API + frontend


Open http://localhost:3000. Demo credentials: see seed/.env.

Basic tests

401/403 (auth & roles) · no negative stock on OUT · scanner with manual fallback.

MVP scope

No multi-tenant, accounting, or supplier integrations. Basic offline (app shell).

Author & use

Ariel Gárate — academic project. License to be defined.
