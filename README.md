# Taskly — Application de gestion de tâches (Todo App)

Application web complète de gestion de tâches : **Spring Boot 3 + JWT + PostgreSQL** côté API,
**Next.js 14 (App Router) + TypeScript + Tailwind CSS** côté interface.

Chaque utilisateur dispose de son propre espace : il ne voit et ne modifie que ses tâches.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Lancement en local](#lancement-en-local)
- [Variables d'environnement](#variables-denvironnement)
- [API REST](#api-rest)
- [Modèle de données](#modèle-de-données)
- [Sécurité](#sécurité)
- [Dépannage](#dépannage)

---

## Fonctionnalités

- Inscription et connexion avec token **JWT** (mot de passe hashé avec BCrypt).
- **CRUD complet** des tâches : création, lecture, modification, suppression.
- Bascule **terminée / non terminée** en un clic (`PATCH /toggle`).
- Filtres **Toutes / En cours / Terminées** appliqués instantanément.
- Isolation des données : chaque requête est limitée aux tâches de l'utilisateur authentifié.
- Interface responsive : écran d'authentification en deux panneaux, tableau de bord avec statistiques,
  barre de progression et retours visuels.
- Protection des routes privées côté frontend + déconnexion automatique si le token expire.
- Validation des données (Bean Validation) et réponses d'erreur JSON homogènes.

## Stack technique

| Couche         | Technologies                                                       |
| -------------- | ------------------------------------------------------------------ |
| Backend        | Java 17, Spring Boot 3.4, Spring Web, Spring Security, Spring Data JPA, Lombok, JJWT |
| Base de données| PostgreSQL 16                                                      |
| Frontend       | Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS 3    |
| Authentification | JWT (HS256) + BCrypt                                             |

## Structure du projet

```
.
├── backend/                                  # API Spring Boot
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/todo/
│       │   ├── TodoApplication.java
│       │   ├── config/SecurityConfig.java    # Spring Security, CORS, stateless
│       │   ├── controller/                   # AuthController, TaskController
│       │   ├── dto/                          # Requêtes / réponses validées
│       │   ├── entity/                       # User, Task
│       │   ├── exception/                    # Exceptions + handler global
│       │   ├── repository/                   # UserRepository, TaskRepository
│       │   ├── security/                     # JWT : service, filtre, principal…
│       │   └── service/                      # AuthService, TaskService
│       └── resources/application.yml
│
├── frontend/                                 # Interface Next.js
│   ├── src/app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # Redirige vers /dashboard
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── dashboard/page.tsx
│   ├── src/components/                       # UI réutilisable + tâches
│   ├── src/context/AuthContext.tsx           # Session JWT côté client
│   └── src/lib/api.ts                        # Client fetch typé
│
└── docker-compose.yml                        # PostgreSQL
```

## Prérequis

- **JDK 17 ou supérieur** (`java -version`)
- **Maven 3.9+** (`mvn -version`) — ou le wrapper de votre IDE
- **Node.js 18.17+** (Node 20 recommandé) et npm
- **PostgreSQL 16** — soit via **Docker** (recommandé), soit une installation locale
- **Docker** + Docker Compose pour la base de données

## Lancement en local

### 1. Démarrer PostgreSQL

Depuis la racine du projet :

```bash
docker compose up -d
```

Cela crée la base `todo_db` avec l'utilisateur `todo_user` / mot de passe `todo_pass` sur le port `5432`.

> Vous préférez une base PostgreSQL locale ? Créez la base et l'utilisateur :
>
> ```sql
> CREATE USER todo_user WITH PASSWORD 'todo_pass';
> CREATE DATABASE todo_db OWNER todo_user;
> ```

Les tables sont créées automatiquement au premier démarrage par Hibernate (`ddl-auto: update`).

### 2. Lancer le backend

```bash
cd backend
mvn spring-boot:run
```

L'API écoute sur **http://localhost:8080**. Vérification rapide :

```bash
curl -i http://localhost:8080/api/tasks
# HTTP/1.1 401 → l'API fonctionne et exige un token
```

### 3. Lancer le frontend

Dans un second terminal :

```bash
cd frontend
cp .env.local.example .env.local   # optionnel : l'URL par défaut est déjà correcte
npm install
npm run dev
```

L'application est disponible sur **http://localhost:3000**.

1. Ouvrez http://localhost:3000/register et créez un compte.
2. Vous êtes automatiquement connecté et redirigé vers le tableau de bord.
3. Ajoutez, modifiez, cochez ou supprimez vos tâches.

### Lancement avec Docker (tout-en-un)

Une fois Docker démarré, la base, l'API et l'interface se lancent ensemble :

```bash
docker compose up --build
```

- Frontend : **http://localhost:3000**
- API : **http://localhost:8080**
- PostgreSQL : `localhost:5432`

Les images sont construites par `backend/Dockerfile` (build Maven → JRE 17) et
`frontend/Dockerfile` (build Next.js → `output: standalone`, Node 20).

```bash
docker compose up --build -d   # en arrière-plan
docker compose logs -f backend # suivre les logs
docker compose down            # arrêter (ajouter -v pour supprimer les données)
```

`NEXT_PUBLIC_API_URL` est inliné au build car l'URL est appelée par le navigateur :
la valeur par défaut `http://localhost:8080/api` convient en local. Pour un autre domaine :

```bash
NEXT_PUBLIC_API_URL=https://api.example.com/api CORS_ALLOWED_ORIGINS=https://example.com \
  docker compose up --build -d
```

### Build de production (optionnel)

```bash
# Backend
cd backend && mvn clean package
java -jar target/todo-api-1.0.0.jar

# Frontend
cd frontend && npm run build && npm start
```

## Variables d'environnement

### Backend (`application.yml`, surchargeables par variables d'environnement)

| Variable               | Défaut                                                    | Description                                   |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------- |
| `SERVER_PORT`          | `8080`                                                    | Port de l'API                                 |
| `DB_URL`               | `jdbc:postgresql://localhost:5432/todo_db`                | URL JDBC PostgreSQL                           |
| `DB_USERNAME`          | `todo_user`                                               | Utilisateur de la base                        |
| `DB_PASSWORD`          | `todo_pass`                                               | Mot de passe de la base                       |
| `JPA_DDL_AUTO`         | `update`                                                  | Stratégie de schéma Hibernate                 |
| `JWT_SECRET`           | *(valeur de dev)*                                         | Secret HS256, **32 caractères minimum**       |
| `JWT_EXPIRATION`       | `86400000`                                                | Durée de vie du token (ms), 24 h par défaut   |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000`                                   | Origines autorisées, séparées par des virgules |

> **En production**, définissez impérativement `JWT_SECRET` avec une valeur longue et aléatoire,
> et passez `JPA_DDL_AUTO=validate` avec des migrations Flyway/Liquibase.

### Frontend (`frontend/.env.local`)

| Variable               | Défaut                      | Description            |
| ---------------------- | --------------------------- | ---------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8080/api` | URL de base de l'API   |

## API REST

Base : `http://localhost:8080/api`

### Authentification (publiques)

| Méthode | Route                | Corps                                        | Réponse |
| ------- | -------------------- | -------------------------------------------- | ------- |
| `POST`  | `/auth/register`     | `{ "username", "email", "password" }`         | `201` + token |
| `POST`  | `/auth/login`        | `{ "email", "password" }`                     | `200` + token |

Exemple de réponse :

```json
{
  "token": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": { "id": 1, "username": "alice", "email": "alice@example.com", "createdAt": "2026-11-12T10:00:00" }
}
```

### Tâches (protégées)

Toutes les routes exigent l'en-tête `Authorization: Bearer <token>`.

| Méthode  | Route                    | Corps                                       | Réponse |
| -------- | ------------------------ | ------------------------------------------- | ------- |
| `GET`    | `/tasks`                 | — (`?filter=all\|active\|completed`)        | `200` liste |
| `POST`   | `/tasks`                 | `{ "title", "description"?, "completed"? }` | `201` tâche |
| `PUT`    | `/tasks/{id}`            | `{ "title", "description"?, "completed"? }` | `200` tâche |
| `PATCH`  | `/tasks/{id}/toggle`     | —                                           | `200` tâche |
| `DELETE` | `/tasks/{id}`            | —                                           | `204` |

Exemple complet :

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')

curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Écrire le README","description":"Documenter l’API"}'

curl "http://localhost:8080/api/tasks?filter=active" -H "Authorization: Bearer $TOKEN"
```

### Codes et format d'erreur

| Code | Cas                                                        |
| ---- | ---------------------------------------------------------- |
| `400`| Validation échouée, filtre inconnu, corps mal formé        |
| `401`| Token absent / invalide / expiré, identifiants incorrects  |
| `404`| Tâche inexistante **ou appartenant à un autre utilisateur** |
| `409`| Email ou nom d'utilisateur déjà utilisé                    |
| `500`| Erreur interne inattendue                                  |

```json
{
  "timestamp": "2026-11-12T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Certaines données sont invalides.",
  "path": "/api/tasks",
  "fieldErrors": { "title": "Le titre est obligatoire" }
}
```

## Modèle de données

### `users`

| Colonne      | Type          | Contraintes                     |
| ------------ | ------------- | ------------------------------- |
| `id`         | BIGSERIAL     | PK                              |
| `username`   | VARCHAR(50)   | NOT NULL, UNIQUE                |
| `email`      | VARCHAR(120)  | NOT NULL, UNIQUE                |
| `password`   | VARCHAR(100)  | NOT NULL (hash BCrypt)          |
| `created_at` | TIMESTAMP     | NOT NULL                        |

### `tasks`

| Colonne       | Type          | Contraintes                            |
| ------------- | ------------- | -------------------------------------- |
| `id`          | BIGSERIAL     | PK                                     |
| `title`       | VARCHAR(150)  | NOT NULL                               |
| `description` | VARCHAR(2000) | NULL                                   |
| `completed`   | BOOLEAN       | NOT NULL, défaut `false`               |
| `user_id`     | BIGINT        | NOT NULL, FK → `users(id)`             |
| `created_at`  | TIMESTAMP     | NOT NULL                               |
| `updated_at`  | TIMESTAMP     | NOT NULL                               |

## Sécurité

- Les mots de passe sont hashés avec **BCrypt** et ne sont jamais renvoyés par l'API.
- API **stateless** : aucune session serveur, chaque requête est authentifiée par le filtre JWT.
- Le token transporte l'email en sujet, sa signature et son expiration sont vérifiées à chaque appel.
- Les requêtes sur une tâche utilisent systématiquement `id + user_id` : impossible d'accéder aux
  données d'un autre utilisateur (réponse `404` volontaire, sans fuite d'information).
- CORS restreint aux origines configurées ; CSRF désactivé car l'API n'utilise pas de cookies.
- Le token côté client est stocké dans `localStorage` (comme demandé). Pour un niveau de sécurité
  supérieur, on privilégiera un cookie `HttpOnly` + `SameSite`.

## Dépannage

| Problème                                            | Solution                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `Connection refused` sur `localhost:5432`           | La base n'est pas démarrée : `docker compose up -d` puis `docker compose ps`. |
| `password authentication failed for user "todo_user"` | La base existe déjà avec un autre mot de passe : supprimez le volume (`docker compose down -v`) et relancez. |
| Le frontend affiche « Impossible de joindre le serveur » | Vérifiez que le backend tourne sur le port 8080 et que `NEXT_PUBLIC_API_URL` est correct. |
| `401` systématique après connexion                 | Vérifiez que `JWT_SECRET` n'a pas changé entre-temps et videz le `localStorage`. |
| Erreur CORS dans le navigateur                      | Ajoutez l'origine du frontend dans `CORS_ALLOWED_ORIGINS`.               |
| `docker compose build` échoue avec `lookup registry-1.docker.io on 127.0.0.53:53: write: permission denied` | Bug du paquet **snap** Docker sous Ubuntu 26.04 : AppArmor interdit à `dockerd` d'interroger le résolveur `systemd-resolved`. Contournement : faire pointer `/etc/resolv.conf` sur les vrais serveurs DNS, puis `sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf && sudo snap restart docker`. Docker installé via apt n'est pas concerné. |
