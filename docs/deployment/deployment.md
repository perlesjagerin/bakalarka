# Deployment - Nasazení do produkce

Tento návod pokrývá deployment na Railway (backend + PostgreSQL) a Vercel (frontend). Tato kombinace nabízí:
- ⚡️ Rychlé nasazení (5-10 minut)
- 💰 Nízké náklady ($0-5/měsíc)
- 🔄 Automatické CI/CD z GitHub
- 📊 Built-in monitoring a logy

> **Poznámka:** Pro produkční nasazení s vysokou návštěvností zvažte VPS nebo Docker (viz sekce [Alternativní Deployment](#alternativní-deployment-možnosti) níže).

---

## Rychlý start: Railway + Vercel

### Prerekvizity

- ✅ GitHub účet (pro Git integration)
- ✅ Railway účet ([railway.app](https://railway.app) - přes GitHub)
- ✅ Vercel účet ([vercel.com](https://vercel.com) - přes GitHub)
- ✅ Stripe účet (live keys)
- ✅ Funkční lokální aplikace s testy

---

## 1. Backend Deployment na Railway

### Krok 1.1: Příprava projektu

1. **Push projektu na GitHub** (pokud ještě není)

```bash
# Inicializujte git repo (pokud ještě není)
cd /Users/I751134/Desktop/bakalarka
git init
git add .
git commit -m "Initial commit for deployment"

# Vytvořte GitHub repo a push
git remote add origin https://github.com/username/your-repo.git
git branch -M main
git push -u origin main
```

2. **Ověřte .gitignore**

Ujistěte se, že `.env` soubory nejsou v git:
```bash
# .gitignore by měl obsahovat:
node_modules/
.env
.env.local
dist/
build/
```

### Krok 1.2: Nastavení Railway

1. **Vytvořte nový projekt**
   - Jděte na [railway.app](https://railway.app)
   - Klikněte "Start a New Project"
   - Vyberte "Deploy from GitHub repo"
   - Autorizujte Railway k přístupu k vašemu GitHub účtu
   - Vyberte repository s vaším projektem

2. **Přidejte PostgreSQL databázi**
   - V projektu klikněte "+ New"
   - Vyberte "Database" → "Add PostgreSQL"
   - Railway automaticky vytvoří databázi a nastaví `DATABASE_URL`

3. **Nastavte backend service**
   - Klikněte na service s vaším GitHub repo
   - Přejděte na "Settings" tab
   - Nastavte:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npx prisma migrate deploy && npm start`
     - **Watch Paths**: `backend/**`

### Krok 1.3: Environment Variables

V Railway backend service, přejděte na "Variables" tab a přidejte:

```env
# Database (automaticky nastaveno Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<generujte silný random string - min 64 znaků>
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# CORS (později doplníte Vercel URL)
CORS_ORIGIN=https://your-app.vercel.app

# Stripe (LIVE keys!)
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generování JWT_SECRET:**
```bash
# Použijte tento příkaz lokálně
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Krok 1.4: Deploy backend

1. **Trigger deploy**
   - Railway automaticky deployuje při každém push do main branch
   - Nebo klikněte "Deploy" v dashboard

2. **Získejte backend URL**
   - V Settings → vygenerujte domain (např. `your-app.up.railway.app`)
   - Nebo přidejte vlastní doménu

3. **Ověřte deployment**
```bash
# Test health endpoint
curl https://your-app.up.railway.app/health

# Mělo by vrátit:
# {"status":"ok","database":"connected"}
```

### Krok 1.5: Nastavení Stripe webhooks

1. **Jděte do Stripe Dashboard** → Developers → Webhooks
2. **Přidejte endpoint:**
   - URL: `https://your-app.up.railway.app/api/payments/webhook`
   - Události: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. **Zkopírujte signing secret** (`whsec_...`)
4. **Aktualizujte `STRIPE_WEBHOOK_SECRET`** v Railway Variables

---

## 2. Frontend Deployment na Vercel

### Krok 2.1: Příprava

1. **Vytvořte frontend/.env.example** (pokud neexistuje)

```env
# Backend API URL
VITE_API_URL=https://your-app.up.railway.app

# Stripe Public Key (LIVE)
VITE_STRIPE_PUBLIC_KEY=pk_live_your_live_public_key
```

### Krok 2.2: Deploy na Vercel

1. **Import projektu**
   - Jděte na [vercel.com](https://vercel.com)
   - Klikněte "Add New..." → "Project"
   - Import GitHub repository
   - Railway může vyžadovat přístup k repo

2. **Konfigurace build settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**

V Vercel project settings → Environment Variables přidejte:

| Proměnná | Hodnota | Environment |
|----------|---------|-------------|
| `VITE_API_URL` | `https://your-app.up.railway.app` | Production |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | Production |

4. **Deploy**
   - Klikněte "Deploy"
   - Vercel automaticky builduje a deployuje
   - Získáte URL typu `your-app.vercel.app`

### Krok 2.3: Aktualizace CORS

**DŮLEŽITÉ:** Aktualizujte `CORS_ORIGIN` v Railway backend variables:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

Nebo pro více domén:
```env
CORS_ORIGIN=https://your-app.vercel.app,https://www.your-domain.com
```

Restartujte Railway backend service po změně.

---

## 3. Post-Deployment Testing

### Checklist

- [ ] **Health check**: `curl https://your-app.up.railway.app/health`
- [ ] **Frontend otevřen**: Otevřete `https://your-app.vercel.app`
- [ ] **Registrace**: Vytvořte testovací účet
- [ ] **Login**: Přihlaste se
- [ ] **Events**: Zkontrolujte načítání eventů
- [ ] **Payment**: Test Stripe platby (použijte test kartu `4242 4242 4242 4242`)
- [ ] **Webhook**: Ověřte, že webhook v Railway logech přijímá eventy
- [ ] **Profil**: Upravte profil a ověřte update

### Debugging

**Railway logs:**
```bash
# V Railway dashboard → View Logs
# Nebo použijte Railway CLI:
railway logs
```

**Vercel logs:**
```bash
# Vercel dashboard → Deployments → klikněte na deployment → View Function Logs
# Nebo Vercel CLI:
vercel logs
```

**Časté problémy:**

| Problém | Řešení |
|---------|--------|
| CORS error | Ověřte `CORS_ORIGIN` v Railway |
| Database connection failed | Zkontrolujte `DATABASE_URL` v Railway |
| Stripe webhook fails | Ověřte `STRIPE_WEBHOOK_SECRET` |
| Frontend nemůže volat API | Zkontrolujte `VITE_API_URL` ve Vercel |
| 502 Bad Gateway | Railway app se možná startuje - počkejte 30s |

---

## 4. Live Stripe Mode

### Krok 4.1: Aktivace live mode

1. **Stripe Dashboard** → Aktivujte účet:
   - Vyplňte business informace
   - Ověřte identitu
   - Nastavte bankovní účet pro výplaty

2. **Získejte live keys**:
   - Developers → API keys
   - Zkopírujte `sk_live_...` (secret) a `pk_live_...` (publishable)

3. **Update environment variables**:
   - **Railway**: `STRIPE_SECRET_KEY=sk_live_...`
   - **Vercel**: `VITE_STRIPE_PUBLIC_KEY=pk_live_...`

4. **Update webhook** (nový endpoint pro live mode):
   - Stripe Dashboard → Developers → Webhooks
   - Přidejte endpoint pro live mode
   - Update `STRIPE_WEBHOOK_SECRET` v Railway

### Krok 4.2: Testování live mode

**DŮLEŽITÉ:** Test cards nefungují v live mode!

```bash
# Použijte reálnou kartu nebo Stripe test cards:
# Test successful: 4242 4242 4242 4242
# Test declined: 4000 0000 0000 0002
```

---

## 5. Vlastní Doména (Volitelné)

### Pro Vercel (Frontend)

1. **Přidejte doménu** v Vercel:
   - Project Settings → Domains
   - Přidejte `www.your-domain.com` a `your-domain.com`

2. **Nastavte DNS záznamy** u registrátoru:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **SSL certifikát**: Automaticky vygenerován Vercel

### Pro Railway (Backend)

1. **Přidejte doménu**:
   - Railway Settings → Domains
   - Přidejte `api.your-domain.com`

2. **DNS záznam**:
   ```
   Type: CNAME
   Name: api
   Value: <railway-provided-cname>
   ```

3. **Update CORS**: Změňte `CORS_ORIGIN` na novou doménu

---

## 6. Náklady

| Služba | Free Tier | Odhadované měsíční náklady |
|--------|-----------|---------------------------|
| Railway | $5 credit/měsíc | $0-5 (závisí na trafficu) |
| Vercel | 100GB bandwidth | $0 (pokud nepřekročíte limity) |
| **Celkem** | | **$0-5/měsíc** |

**Pro větší provoz:**
- Railway Pro: $20/měsíc (unlimited deployments)
- Vercel Pro: $20/měsíc (unlimited bandwidth)

---

## Alternativní Deployment možnosti

Pokud preferujete jiné platformy nebo potřebujete více kontroly:

### A) VPS (DigitalOcean, Linode, Hetzner)

1. **Nainstalujte Node.js a PostgreSQL na serveru**

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install postgresql postgresql-contrib
```

2. **Nastavte databázi**

```bash
sudo -u postgres psql
CREATE DATABASE ticket_reservation;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE ticket_reservation TO myuser;
```

3. **Nastavte PM2 pro běh aplikace**

```bash
npm install -g pm2
pm2 start dist/index.js --name "ticket-backend"
pm2 startup
pm2 save
```

4. **Nastavte Nginx jako reverse proxy**

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Nastavte SSL s Let's Encrypt**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

#### B) Heroku

1. **Vytvořte `Procfile` v backend složce**

```
web: npm start
release: npx prisma migrate deploy
```

2. **Nasaďte**

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET="your-secret"
heroku config:set STRIPE_SECRET_KEY="sk_live_..."
# ... další env variables
git subtree push --prefix backend heroku main
```

#### C) Docker

1. **Vytvořte `Dockerfile` v backend složce**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

2. **Docker Compose s PostgreSQL**

```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: ticket_reservation
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: "postgresql://myuser:mypassword@db:5432/ticket_reservation"
      JWT_SECRET: "your-secret"
    depends_on:
      - db

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

---

## 2. Frontend Deployment

### Build

```bash
cd frontend
npm install
npm run build
```

Výsledná `dist` složka obsahuje statické soubory.

### Deployment možnosti

#### A) Vercel (doporučeno pro React)

1. **Instalace Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
cd frontend
vercel --prod
```

3. **Environment variables**

V Vercel dashboard nastavte:
- `VITE_API_URL=https://api.your-domain.com`

#### B) Netlify

1. **Vytvořte `netlify.toml` ve frontend složce**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy přes Netlify CLI nebo Git integration**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### C) Nginx (statické soubory)

1. **Zkopírujte build na server**

```bash
scp -r dist/* user@server:/var/www/your-domain.com/
```

2. **Nginx konfigurace**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-domain.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip komprese
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

3. **SSL certifikát**

```bash
sudo certbot --nginx -d your-domain.com
```

---

## 3. Database Management

### Migrace v produkci

```bash
# Na produkčním serveru
cd backend
npx prisma migrate deploy
```

### Backup strategie

**Automatický denní backup:**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="ticket_reservation"

pg_dump -U myuser $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Smazat backupy starší než 30 dní
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

Nastavte cron job:
``✅ Code splitting (již implementováno v Vite)
- ✅ Lazy loading routes
- ✅ Image optimization
- CDN pro static assets (Vercel CDN automaticky)

---

## 8. Continuous Integration/Deployment

### Automatické Deploymenty

**Railway:**
- Auto-deploy z `main` branch
- Změňte v Settings → GitHub Triggers
- Podporuje preview deployments pro PR

**Vercel:**
- Auto-deploy z `main` branch
- Preview deployments pro každý PR
- Environment variables per branch

### Pre-Deployment Checks

Vytvořte `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Backend tests
        run: |
          cd backend
          npm ci
          npx prisma generate
          npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Frontend tests
        run: |
          cd frontend
          npm ci
          npm test
```

---

## 9. Monitoring a Logging

### Railway Monitoring

Railway dashboard poskytuje:
- 📊 CPU/Memory usage grafy
- 📝 Real-time logs
- ⚡️ Deploy history
- 🔔 Alerts (pro Pro plan)

### Vercel Analytics

Aktivujte v Vercel dashboard:
- Web Analytics (zdarma)
- Speed Insights
- Error tracking

### Externí Monitoring

**Doporučené služby:**

1. **Sentry** (Error tracking)
```bash
npm install @sentry/node @sentry/react
```

2. **UptimeRobot** (Uptime monitoring - zdarma)
   - Monitoruje každých 5 minut
   - Email alerts při downtime

3. **LogTail/BetterStack** (Advanced logging)
   - Strukturované logy
   - Search a filtering
   - Alerts

---

## 10. Backup Strategie

### Database Backups

**Railway automatické backups:**
- Free plan: Žádné automatické backupy
- Pro plan: Denní automatické backupy

**Manuální backup:**
```bash
# Získejte DATABASE_URL z Railway
# Spusťte lokálně:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**Nastavte cron job pro automatické backupy:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > ~/backups/backup_$DATE.sql

# Upload na S3/Dropbox/Google Drive
# aws s3 cp ~/backups/backup_$DATE.sql s3://your-bucket/
```

### Code Backups

- ✅ GitHub slouží jako backup (git push)
- ✅ Railway/Vercel mají deployment history

---

## 11. Security Checklist

- [ ] ✅ SSL certifikáty (automaticky Railway + Vercel)
- [ ] ✅ Environment variables nejsou v git
- [ ] ✅ JWT secret je silný (64+ znaků)
- [ ] ✅ Database není veřejně přístupná
- [ ] ✅ Rate limiting aktivní (100 req/15min)
- [ ] ✅ Helmet security headers zapnuté
- [ ] ✅ CORS správně nakonfigurován
- [ ] Stripe live keys zabezpečené
- [ ] Pravidelné `npm audit` a updates
- [ ] 2FA na GitHub/Railway/Vercel účtech

```bash
# Kontrola bezpečnostních zranitelností
npm audit
npm audit fix

# Update dependencies
npm update
```

---

## 12. Monitoring a Logging

### PM2 Monitoring

```bash
pm2 monit
pm2 logs
```

### Error Tracking (Sentry)

1. **Instalace**

```bash
npm install @sentry/node
```

2. **Konfigurace v backend/src/index.ts**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### Uptime Monitoring

Použijte služby jako:
- UptimeRobot (zdarma)
- Pingdom
- Better Uptime

---

## 5. Security Checklist

- [ ] SSL certifikát nainstalován
- [ ] Environment variables nejsou v git
- [ ] JWT secret je silný a unikátní
- [ ] Database credentials jsou bezpečné
- [ ] Rate limiting je aktivní
- [ ] CORS je správně nakonfigurován
- [ ] Helmet security headers jsou zapnuté
- [ ] PostgreSQL není veřejně přístupná
- [ ] Pravidelné bezpečnostní aktualizace

```bash
# Kontrola bezpečnostních zranitelností
npm audit
npm audit fix
```

---

## 6. CI/CD Pipeline (GitHub Actions)

Vytvořte `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Deploy to production
        run: |
          # Váš deploy script
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install and build
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 7. Performance Optimization

### Backend

- Povolit compression middleware
- Implementovat Redis cache pro session
- Database connection pooling
- Optimalizovat Prisma queries

### Frontend

- Code splitting
- Lazy loading routes
- Image optimization
- CDN pro static assets

---

## 8. Troubleshooting

### Časté problémy

**Problem:** Database connection error
```bash
# Zkontrolujte DATABASE_URL
echo $DATABASE_URL
# Test spojení
psql $DATABASE_URL
```

**Problem:** Port already in use
```bash
# Najděte proces na portu 3001
lsof -i :3001
# Ukončete proces
kill -9 <PID>
```

**Problem:** Prisma migrate fails
```bash
# Reset databáze (POUZE development!)
npx prisma migrate reset
# Produkce:
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Kontakty pro podporu

- Dokumentace Prisma: https://www.prisma.io/docs
- Stripe dokumentace: https://stripe.com/docs
- Node.js best practices: https://github.com/goldbergyoni/nodebestpractices
