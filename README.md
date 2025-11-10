# Bob's Corn API (Express + TypeScript + Redis)

API robusta que implementa:
- **Rate limit distribuido**: 1 compra por cliente cada 60s (ventana deslizante en Redis con Lua).
- **Auth JWT**: access token + refresh token **rotatorio** (refresh almacenado/revocable en Redis).
- **Arquitectura**: Hexagonal (Ports & Adapters).
- **Observabilidad**: pino + pino-http; pretty en dev (opcional).
- **CORS**: expone headers de rate-limit para el frontend.

---

## Requisitos

- Node.js **>= 20**
- Redis **>= 6** (puedes usar Docker)
- npm **>= 9**

---


## Instalación

```bash
npm i
# (opcional) Redis con Docker
docker compose up -d
```

Crea .env (a partir de .env.example si existe):
```bash
PORT=3000
NODE_ENV=development

REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173

# JWT (usa valores distintos y fuertes)
JWT_ACCESS_SECRET=<<base64url_32-64_bytes>>
JWT_REFRESH_SECRET=<<base64url_32-64_bytes>>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

Generar secretos fuertes (base64url)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"
```

Ejecución 
```bash
# desarrollo (tsx + HMR)
npm run dev

# producción
npm run build
npm start
```

Healt
```bash
GET /healthz -> 200 { ok: true }
```

Auth
```bash
POST /api/v1/auth/register
Body: { "email": "...", "name": "...", "password": "..." }
-> 201 { id, email, name }

POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
-> 200 { user, tokens: { accessToken, refreshToken, refreshJti } }

POST /api/v1/auth/refresh
Body: { "refreshToken": "..." }
-> 200 { accessToken, refreshToken, refreshJti }

POST /api/v1/auth/logout
Body: { "jti": "..." }  # refreshJti vigente
-> 204
```

Compras (protegido + rate limit)
```bash
POST /api/v1/corn/purchase
Headers: Authorization: Bearer <access>
-> 200 "Corn"
```

Prueba rápida en curl
```bash
# Registro
curl -sX POST :3000/api/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","name":"Alice","password":"SuperSecret1!"}'

# Login
LOGIN=$(curl -sX POST :3000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"SuperSecret1!"}')
ACCESS=$(echo "$LOGIN" | jq -r '.tokens.accessToken')

# Compra OK
curl -i -X POST :3000/api/v1/corn/purchase -H "Authorization: Bearer $ACCESS"

# Compra inmediata (429 + headers)
curl -i -X POST :3000/api/v1/corn/purchase -H "Authorization: Bearer $ACCESS"
```