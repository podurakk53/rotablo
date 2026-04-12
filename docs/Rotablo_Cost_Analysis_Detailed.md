# Rotablo Maliyet Analizi - Detaylı

**Versiyon**: 1.0  
**Tarih**: 2026-04-09

> Status note (2026-04-12): Bu doküman tarihsel maliyet keşfidir. Güncel teknik yön için `Rotablo_Application_Architecture_v0.md` dosyasını esas alın. Özellikle Supabase-first yön, admin-first yapı ve custom backend'i erteleme kararı burada geçen bazı eski varsayımları geçersiz kılar.

## 1. Masraf Kalemleri Detaylı Analiz

### 1.1 Backend Hosting: Railway ($5-20/month)

**Gereklilik**: ZORUNLU
- Backend API'yi host etmek için gerekli
- Auto-scaling, deployment, monitoring sağlar

**Railway Detayları**:
```
Hobby Plan: $5/month
- 512MB RAM
- 0.5 vCPU
- 1GB disk
- Yeterli mi? İlk 100 kullanıcı için evet

Developer Plan: $20/month
- 8GB RAM
- 8 vCPU
- 100GB disk
- Yeterli mi? 1000 kullanıcıya kadar evet
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **Render** | $7-25 | Railway'e benzer, biraz ucuz | Daha yavaş deploy | ✅ İyi alternatif |
| **Fly.io** | $0-10 | Free tier var, hızlı | Karmaşık config | ⚠️ Teknik bilgi gerekir |
| **Vercel** | $0-20 | Serverless, kolay | Cold start, timeout limiti | ❌ Backend için uygun değil |
| **AWS EC2** | $10-50 | Güçlü, esnek | Karmaşık, yönetim gerekir | ❌ MVP için overkill |
| **DigitalOcean** | $6-24 | Basit, ucuz | Manuel setup, scaling zor | ⚠️ DevOps bilgisi gerekir |
| **Heroku** | $7-25 | Kolay, güvenilir | Pahalı, yavaş | ⚠️ Railway daha iyi |

**Öneri**: Railway ile başla, 1000+ kullanıcıda Render'a geç (daha ucuz)

---

### 1.2 Database: Supabase Pro ($25/month)

**Gereklilik**: ZORUNLU
- PostgreSQL + PostGIS (coğrafi veri)
- Auth servisi (email, OAuth)
- Row Level Security

**Supabase Detayları**:
```
Free Tier: $0/month
- 500MB database
- 2GB bandwidth
- 50k MAU (monthly active users)
- Yeterli mi? İlk 50 kullanıcı için evet, ama risk var

Pro Plan: $25/month
- 8GB database
- 50GB bandwidth
- 100k MAU
- Daily backups
- Yeterli mi? 1000 kullanıcıya kadar evet
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **Neon** | $0-19 | Serverless, ucuz, PostGIS support | Auth yok (ayrı çözüm gerekir) | ✅ Auth'u kendin yaparsan iyi |
| **PlanetScale** | $0-39 | Serverless, hızlı | PostGIS yok, MySQL | ❌ Coğrafi veri için uygun değil |
| **Railway PostgreSQL** | $5-10 | Backend ile aynı yerde | Auth yok, backup manuel | ⚠️ Auth için Supabase Auth kullanılabilir |
| **AWS RDS** | $15-100 | Güçlü, güvenilir | Karmaşık, pahalı | ❌ MVP için overkill |
| **Self-hosted** | $6-12 | Tam kontrol, ucuz | Yönetim, backup, scaling | ❌ Zaman kaybı |

**Öneri**: Supabase Pro ile başla (Auth + DB + Backup hepsi dahil)

**Alternatif Strateji** (Maliyet düşürme):
```
Neon Free ($0) + Supabase Auth Only ($0) = $0/month
- Neon: Database (PostGIS support var)
- Supabase: Sadece Auth servisi (database kullanmadan)
- Toplam: $0/month (ilk 1000 kullanıcı için yeterli)
- Risk: Free tier limitleri
```

---

### 1.3 Redis: Upstash ($0-10/month)

**Gereklilik**: YÜKSEK (ama V1'de opsiyonel)
- API cache (hız artışı)
- Rate limiting (güvenlik)
- Session storage
- Background job queue (BullMQ)

**Upstash Detayları**:
```
Free Tier: $0/month
- 10k commands/day
- 256MB storage
- Yeterli mi? İlk 100 kullanıcı için evet

Pay-as-you-go: $0.2 per 100k commands
- Örnek: 100k commands/day = $60/month
- Örnek: 10k commands/day = $0/month (free tier)
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **Railway Redis** | $5 | Backend ile aynı yerde | Pahalı | ⚠️ Upstash daha ucuz |
| **Redis Cloud** | $0-5 | Güvenilir | Free tier küçük | ✅ İyi alternatif |
| **Self-hosted** | $0 | Ücretsiz | Yönetim gerekir | ❌ Zaman kaybı |
| **In-memory (Node.js)** | $0 | Basit | Restart'ta kaybolur, scaling yok | ❌ Production'a uygun değil |

**Öneri**: Upstash Free ile başla, gerekirse upgrade

**V1'de Redis Olmadan Çalışır mı?**
```
Evet, ama:
- API daha yavaş (cache yok)
- Rate limiting basit (memory-based)
- Background jobs yok (sync işlemler)

Öneri: V1'de Redis'siz başla, 100+ kullanıcıda ekle
```

---

### 1.4 File Storage: Cloudflare R2 ($1-5/month)

**Gereklilik**: ORTA (V1'de opsiyonel)
- Rota görselleri (hero images)
- Achievement badge'leri
- Kullanıcı profil fotoğrafları (V2)

**Cloudflare R2 Detayları**:
```
Pay-as-you-go:
- Storage: $0.015/GB/month
- Class A operations (write): $4.50 per million
- Class B operations (read): $0.36 per million

Örnek (V1):
- 10GB storage (100 rota × 100MB) = $0.15/month
- 100k read requests = $0.036/month
- Toplam: ~$0.20/month

Örnek (1000 kullanıcı):
- 50GB storage = $0.75/month
- 1M read requests = $0.36/month
- Toplam: ~$1.11/month
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **AWS S3** | $1-10 | Güvenilir, yaygın | Egress ücretli ($0.09/GB) | ❌ R2 daha ucuz |
| **Supabase Storage** | $0-10 | Entegre | Pahalı ($0.021/GB) | ⚠️ R2 daha ucuz |
| **Backblaze B2** | $0.005/GB | Çok ucuz | Daha az bilinen | ✅ İyi alternatif |
| **App Bundle** | $0 | Ücretsiz, offline | App boyutu büyür | ⚠️ Sadece kritik assetler için |

**Öneri**: Cloudflare R2 (ucuz, CDN entegrasyonu)

**V1'de File Storage Olmadan Çalışır mı?**
```
Evet:
- Tüm görseller app bundle'da (statik)
- App boyutu: +50-100MB
- Güncelleme: App release gerekir

Öneri: V1'de bundle, V2'de R2'ye geç
```

---

### 1.5 Mobile Build: Expo EAS ($0-29/month)

**Gereklilik**: ZORUNLU (ama free tier var)
- iOS/Android build
- OTA updates (code push)
- TestFlight/Play Store integration

**Expo EAS Detayları**:
```
Free Tier: $0/month
- 30 builds/month
- OTA updates: Unlimited
- Yeterli mi? Development için evet, production için hayır

Production Plan: $29/month
- Unlimited builds
- Priority queue
- Team collaboration
- Yeterli mi? Evet
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **Fastlane** | $0 | Ücretsiz, güçlü | Karmaşık setup, Mac gerekir | ❌ Zaman kaybı |
| **GitHub Actions** | $0-20 | CI/CD entegre | Mac runner pahalı ($0.08/min) | ⚠️ Teknik bilgi gerekir |
| **Local Build** | $0 | Tam kontrol | Mac gerekir, manuel | ❌ Sürdürülebilir değil |
| **CodeMagic** | $0-95 | Güçlü, kolay | Pahalı | ❌ EAS daha ucuz |

**Öneri**: EAS Free ile başla, production'da EAS Production ($29)

**V1'de EAS Olmadan Çalışır mı?**
```
Evet, ama:
- Local build (Mac gerekir)
- OTA updates yok (her güncelleme app store'dan)
- TestFlight/Play Store manuel upload

Öneri: EAS Free ile başla, launch'ta Production'a geç
```

---

### 1.6 Maps: Mapbox ($0-50/month)

**Gereklilik**: ZORUNLU
- Harita görüntüleme
- Offline tiles
- Route visualization
- GPS tracking

**Mapbox Detayları**:
```
Free Tier: $0/month
- 50k map loads/month
- Unlimited offline tiles
- Yeterli mi? İlk 500 kullanıcı için evet (100 load/user/month)

Pay-as-you-go: $5 per 1000 loads (50k sonrası)
- 100k loads = $5/month
- 200k loads = $55/month
```

**Map Load Nedir?**
```
1 map load = Harita ekranı açıldığında
- Route detail: 1 load
- Stage detail: 1 load
- Active trip: 1 load

Örnek kullanıcı (aylık):
- 10 rota görüntüleme = 10 loads
- 50 etap görüntüleme = 50 loads
- 5 aktif sürüş = 5 loads
- Toplam: 65 loads/user/month

1000 kullanıcı = 65k loads = $5/month
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **Google Maps** | $200+ | Yaygın, güvenilir | Pahalı ($7/1000 loads), offline yok | ❌ Çok pahalı |
| **MapLibre** | $0 | Açık kaynak, ücretsiz | Tile server gerekir | ⚠️ Teknik bilgi gerekir |
| **OpenStreetMap** | $0 | Ücretsiz | Tile server gerekir, styling zor | ⚠️ Teknik bilgi gerekir |
| **Apple Maps** | $0 | iOS'ta native | Android'de yok, offline zor | ❌ Cross-platform değil |

**Öneri**: Mapbox (offline tiles, custom styling, affordable)

**Maliyet Optimizasyonu**:
```
1. Cache map tiles aggressively
2. Lazy load maps (sadece gerektiğinde)
3. Reduce map interactions (zoom, pan)
4. Use static maps for previews (cheaper)
```

---

### 1.7 Error Tracking: Sentry ($0-26/month)

**Gereklilik**: YÜKSEK (ama V1'de opsiyonel)
- Frontend/backend error tracking
- Performance monitoring
- Release tracking

**Sentry Detayları**:
```
Developer Plan: $0/month
- 5k errors/month
- 1 user
- 30 days retention
- Yeterli mi? Development için evet

Team Plan: $26/month
- 50k errors/month
- Unlimited users
- 90 days retention
- Yeterli mi? 1000 kullanıcıya kadar evet
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **LogRocket** | $99+ | Session replay, güçlü | Çok pahalı | ❌ MVP için overkill |
| **Bugsnag** | $0-59 | Sentry'ye benzer | Daha az özellik | ⚠️ Sentry daha iyi |
| **Self-hosted Sentry** | $10-20 | Ucuz, tam kontrol | Yönetim gerekir | ⚠️ Zaman kaybı |
| **Console.log** | $0 | Ücretsiz | Production'da kullanışsız | ❌ Ciddi değil |

**Öneri**: Sentry Developer (free) ile başla, launch'ta Team ($26)

**V1'de Sentry Olmadan Çalışır mı?**
```
Evet, ama:
- Error'ları göremezsin (kullanıcı bildirene kadar)
- Performance sorunlarını tespit edemezsin
- Crash rate bilinmez

Öneri: Sentry Developer (free) ile başla
```

---

### 1.8 Analytics: PostHog ($0/month - Self-hosted)

**Gereklilik**: YÜKSEK (ama V1'de opsiyonel)
- User events tracking
- Funnel analysis
- Feature flags
- A/B testing (V2)

**PostHog Detayları**:
```
Self-hosted: $0/month (Railway'de host edilir)
- Unlimited events
- Unlimited users
- Tam kontrol
- Maliyet: Railway'de +$5-10/month (ekstra RAM)

Cloud: $0-20/month
- 1M events/month free
- $0.00031 per event sonrası
- Yönetim yok
```

**Alternatifler**:

| Alternatif | Aylık Maliyet | Artıları | Eksileri | Öneri |
|------------|---------------|----------|----------|-------|
| **Mixpanel** | $0-20 | Güçlü, mature | Pahalı (100k MTU sonrası) | ⚠️ PostHog daha ucuz |
| **Amplitude** | $0-49 | Güçlü, popüler | Pahalı | ⚠️ PostHog daha ucuz |
| **Google Analytics** | $0 | Ücretsiz, yaygın | Mobile için zayıf | ❌ Event tracking zayıf |
| **Custom (Database)** | $0 | Tam kontrol | Geliştirme gerekir | ❌ Zaman kaybı |

**Öneri**: PostHog Cloud (free tier) ile başla, self-hosted'a geç

**V1'de Analytics Olmadan Çalışır mı?**
```
Evet, ama:
- Kullanıcı davranışını göremezsin
- Hangi özellikler kullanılıyor bilinmez
- Funnel conversion rates bilinmez

Öneri: PostHog Cloud (free) ile başla
```

---

## 2. Maliyet Senaryoları

### Senaryo 1: Minimum Viable (Riskli)

**Toplam: $5-10/month**

```
✅ Railway Hobby: $5
✅ Neon Free: $0
✅ Supabase Auth Only: $0
✅ Upstash Free: $0
✅ App Bundle (images): $0
✅ EAS Free: $0
✅ Mapbox Free: $0
✅ Sentry Free: $0
✅ PostHog Free: $0
```

**Riskler**:
- Free tier limitleri (50 kullanıcı max)
- Backup yok (Neon free)
- Build limiti (30/month)
- Support yok

**Uygun mu?**: İlk 50 kullanıcı için evet, sonra upgrade gerekir

---

### Senaryo 2: Recommended (Dengeli)

**Toplam: $60/month**

```
✅ Railway Developer: $20
✅ Supabase Pro: $25
✅ Upstash Free: $0
✅ Cloudflare R2: $1
✅ EAS Production: $29
✅ Mapbox Free: $0
✅ Sentry Team: $26
✅ PostHog Cloud: $0
```

**Avantajlar**:
- 1000 kullanıcıya kadar yeterli
- Daily backups
- Unlimited builds
- Error tracking
- Support var

**Uygun mu?**: Launch için ideal

---

### Senaryo 3: Production-Ready (Güvenli)

**Toplam: $155/month**

```
✅ Railway Developer: $20
✅ Supabase Pro: $25
✅ Upstash Pay-as-you-go: $10
✅ Cloudflare R2: $5
✅ EAS Production: $29
✅ Mapbox: $50 (200k loads)
✅ Sentry Team: $26
✅ PostHog Cloud: $20
```

**Avantajlar**:
- 5000 kullanıcıya kadar yeterli
- Tüm özellikler aktif
- Monitoring tam
- Scaling hazır

**Uygun mu?**: 1000+ kullanıcı için ideal

---

## 3. Maliyet Optimizasyon Stratejileri

### 3.1 Kısa Vadeli (0-3 ay)

1. **Free tier'ları kullan**
   - Neon Free + Supabase Auth Only = $0
   - Upstash Free = $0
   - EAS Free = $0
   - Mapbox Free = $0
   - Sentry Free = $0
   - PostHog Free = $0

2. **App bundle kullan**
   - Görseller bundle'da = $0
   - R2'ye gerek yok

3. **Redis'siz başla**
   - In-memory cache = $0
   - Upstash'e gerek yok

**Toplam: $5-10/month** (sadece Railway)

### 3.2 Orta Vadeli (3-6 ay)

1. **Supabase Pro'ya geç**
   - Backup + Auth + DB = $25
   - Güvenilirlik artar

2. **EAS Production'a geç**
   - Unlimited builds = $29
   - OTA updates

3. **Sentry Team'e geç**
   - Error tracking = $26
   - Production monitoring

**Toplam: $80/month**

### 3.3 Uzun Vadeli (6+ ay)

1. **Scaling için optimize et**
   - Railway → Render (daha ucuz)
   - Supabase → Neon + separate Auth
   - Mapbox → MapLibre (self-hosted tiles)

2. **Self-hosted servislere geç**
   - PostHog self-hosted
   - Sentry self-hosted
   - Redis self-hosted

**Toplam: $50-100/month** (1000+ kullanıcı için)

---

## 4. Sonuç ve Öneriler

### Başlangıç Stratejisi (İlk 3 ay)

**Öneri**: Minimum Viable + Selective Upgrades

```
Railway Hobby: $5
Neon Free: $0
Supabase Auth: $0
Upstash Free: $0
App Bundle: $0
EAS Free: $0
Mapbox Free: $0
Sentry Free: $0
PostHog Free: $0

Toplam: $5/month
```

**Upgrade Trigger'ları**:
- 50 kullanıcı → Supabase Pro ($25)
- 100 kullanıcı → Railway Developer ($20)
- Launch → EAS Production ($29)
- Launch → Sentry Team ($26)

### Launch Stratejisi (3-6 ay)

**Öneri**: Recommended Setup

```
Railway Developer: $20
Supabase Pro: $25
EAS Production: $29
Sentry Team: $26

Toplam: $100/month
```

### Scaling Stratejisi (6+ ay)

**Öneri**: Production-Ready + Optimization

```
Render: $15 (Railway'den geç)
Neon Pro: $19 (Supabase'den geç)
Clerk: $25 (Auth için)
Upstash: $10
R2: $5
EAS: $29
Mapbox: $50
Sentry: $26
PostHog: $20

Toplam: $199/month (5000+ kullanıcı)
```

---

**Kritik Karar Noktaları**:

1. **Database**: Supabase (kolay) vs Neon (ucuz)
2. **Auth**: Supabase Auth (entegre) vs Clerk (güçlü)
3. **Maps**: Mapbox (kolay) vs MapLibre (ucuz)
4. **Hosting**: Railway (kolay) vs Render (ucuz)

**Genel Öneri**: Kolay olanla başla, büyüdükçe optimize et.
