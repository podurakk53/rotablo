# Rotablo Sistem Çalışma Akışı - Detaylı

**Versiyon**: 1.0  
**Tarih**: 2026-04-09

## 1. Sistem Başlangıç Akışı (Cold Start)

### 1.1 Backend Başlatma

```
1. Railway container başlatılır
   ↓
2. Node.js process başlar
   ↓
3. Environment variables yüklenir (.env)
   ↓
4. Prisma ORM initialize edilir
   ├─ Database connection pool oluşturulur (10 connections)
   ├─ Schema validation yapılır
   └─ Migrations check edilir
   ↓
5. Supabase Auth client initialize edilir
   ├─ JWT secret yüklenir
   └─ OAuth providers configure edilir
   ↓
6. Redis connection kurulur (Upstash)
   ├─ Connection test edilir
   └─ Cache warming başlar (hot data)
   ↓
7. Fastify server başlatılır
   ├─ Routes register edilir
   ├─ Middleware'ler yüklenir
   ├─ Error handlers attach edilir
   └─ Health check endpoint aktif olur
   ↓
8. Background jobs başlatılır (BullMQ)
   ├─ Sync queue worker
   ├─ XP calculation worker
   └─ Achievement check worker
   ↓
9. Server listen başlar (port 3000)
   ↓
10. Health check: OK
```

**Süre**: ~5-10 saniye

---

### 1.2 Mobile App Başlatma

```
1. App launch (splash screen)
   ↓
2. React Native bridge initialize
   ↓
3. JavaScript bundle yüklenir
   ↓
4. Zustand store initialize edilir
   ├─ Persisted state restore edilir (AsyncStorage)
   ├─ User session check edilir
   └─ App state hazırlanır
   ↓
5. WatermelonDB initialize edilir
   ├─ SQLite database açılır
   ├─ Schema migration check edilir
   └─ Cached data yüklenir
   ↓
6. React Query initialize edilir
   ├─ Cache restore edilir
   └─ Stale queries refetch edilir
   ↓
7. Location services check edilir
   ├─ Permission status check edilir
   └─ GPS availability check edilir
   ↓
8. Mapbox initialize edilir
   ├─ Access token validate edilir
   └─ Offline tiles check edilir
   ↓
9. Auth state check edilir
   ├─ Token validate edilir (API call)
   ├─ Refresh token if needed
   └─ User data fetch edilir
   ↓
10. Navigation ready
    ├─ Logged in → Home screen
    └─ Not logged in → Auth screen
```

**Süre**: ~2-3 saniye

---

## 2. Kullanıcı Akışları (User Flows)

### 2.1 Kayıt Akışı (Registration)

```
[Mobile App]
1. User taps "Kayıt Ol"
   ↓
2. Email/password form gösterilir
   ↓
3. User form doldurur
   ↓
4. Form validation (client-side)
   ├─ Email format check
   ├─ Password strength check
   └─ Terms acceptance check
   ↓
5. POST /api/auth/register
   ↓
[Backend API]
6. Request validation (Zod schema)
   ↓
7. Supabase Auth: createUser()
   ├─ Email uniqueness check
   ├─ Password hash
   └─ User record create
   ↓
8. Database: User record insert (Prisma)
   ↓
9. Email verification sent (optional V1)
   ↓
10. JWT tokens generate
    ├─ Access token (1 hour)
    └─ Refresh token (30 days)
    ↓
11. Response: { user, tokens }
    ↓
[Mobile App]
12. Tokens store edilir (SecureStore)
    ↓
13. User state update edilir (Zustand)
    ↓
14. Navigate to Onboarding
    ├─ Vehicle profile (optional)
    └─ Skip → Home screen
```

**Süre**: ~1-2 saniye

---

### 2.2 Rota Keşfi Akışı (Route Discovery)

```
[Mobile App]
1. User Home screen'de
   ↓
2. GET /api/routes (React Query)
   ├─ Cache check (stale-while-revalidate)
   ├─ Cache hit → Instant render
   └─ Cache miss → Loading state
   ↓
[Backend API]
3. Auth middleware: Token validate
   ↓
4. Redis cache check
   ├─ Cache hit → Return cached data
   └─ Cache miss → Database query
   ↓
5. Database query (Prisma)
   ```sql
   SELECT * FROM routes
   WHERE status = 'active'
   ORDER BY sort_order ASC
   ```
   ↓
6. Response transform
   ├─ Add hero image URLs
   ├─ Calculate stats
   └─ Format response
   ↓
7. Redis cache set (1 hour TTL)
   ↓
8. Response: { data: routes[], pagination }
   ↓
[Mobile App]
9. React Query cache update
   ↓
10. UI render (FlatList)
    ├─ Route cards
    ├─ Hero images (lazy load)
    └─ Stats (distance, days, difficulty)
    ↓
11. User taps route card
    ↓
12. Navigate to Route Detail
```

**Süre**: 
- Cache hit: ~100ms
- Cache miss: ~300-500ms

---

### 2.3 Rota Detay Akışı (Route Detail)

```
[Mobile App]
1. Route Detail screen mount
   ↓
2. GET /api/routes/:id (React Query)
   ↓
[Backend API]
3. Database query (Prisma)
   ```sql
   SELECT r.*, 
          COUNT(s.id) as stage_count,
          SUM(s.distance_km) as total_distance
   FROM routes r
   LEFT JOIN stages s ON s.route_id = r.id
   WHERE r.id = :id AND r.status = 'active'
   GROUP BY r.id
   ```
   ↓
4. Response: { route, stages[], sideQuests[] }
   ↓
[Mobile App]
5. UI render
   ├─ Route header (hero image, name, stats)
   ├─ Map preview (Mapbox)
   ├─ Stage list (FlatList)
   └─ Action buttons (Create Trip, Share)
   ↓
6. User taps "Plan Oluştur"
   ↓
7. Navigate to Trip Planning
```

**Süre**: ~300-500ms

---

### 2.4 Trip Planning Akışı (Trip Creation)

```
[Mobile App]
1. Trip Planning screen mount
   ↓
2. Route data already cached (from previous screen)
   ↓
3. UI render
   ├─ Trip name input
   ├─ Vehicle profile selector
   ├─ Stage list (checkboxes)
   ├─ Side quest toggles
   ├─ Budget simulator
   └─ Warnings panel
   ↓
4. User selects stages
   ├─ Local state update (Zustand)
   ├─ Budget recalculate (client-side)
   └─ Distance recalculate (client-side)
   ↓
5. User taps "Kaydet"
   ↓
6. POST /api/trips
   {
     routeId: "uuid",
     vehicleProfileId: "uuid",
     name: "Ege Turu 2026",
     selections: [
       { entityType: "stage", entityId: "uuid" },
       { entityType: "sideQuest", entityId: "uuid" }
     ]
   }
   ↓
[Backend API]
7. Transaction başlar (Prisma)
   ↓
8. TripPlan insert
   ↓
9. TripSelection bulk insert (selections array)
   ↓
10. Budget calculate (server-side)
    ├─ Fuel cost: distance × consumption × price
    ├─ Lodging cost: days × lodging rate
    ├─ Food cost: days × food rate
    └─ Fixed fees: sum(stage.fixedRouteFeeTl)
    ↓
11. TripPlan update (plannedTotalCostTl)
    ↓
12. Transaction commit
    ↓
13. Response: { tripPlan }
    ↓
[Mobile App]
14. Trip data cache edilir (React Query)
    ↓
15. Offline data sync başlar
    ├─ Trip plan → WatermelonDB
    ├─ Selected stages → WatermelonDB
    ├─ Selected side quests → WatermelonDB
    └─ Hazard profiles → WatermelonDB
    ↓
16. Navigate to Trip Detail
```

**Süre**: ~500-1000ms

---

### 2.5 Offline Data Sync Akışı (Trip Download)

```
[Mobile App]
1. Trip created (from previous flow)
   ↓
2. "Offline İndir" prompt gösterilir
   ↓
3. User taps "İndir"
   ↓
4. Download başlar (background)
   ├─ Progress indicator gösterilir
   └─ Cancelable
   ↓
5. API calls (parallel)
   ├─ GET /api/routes/:id
   ├─ GET /api/stages (selected stages)
   ├─ GET /api/side-quests (selected)
   ├─ GET /api/achievements (related)
   └─ GET /api/geo-assets (route geometry)
   ↓
6. WatermelonDB batch insert
   ├─ Route record
   ├─ Stage records
   ├─ SideQuest records
   ├─ Achievement records
   └─ GeoAsset records
   ↓
7. Mapbox offline tiles download
   ├─ Calculate bbox (route geometry)
   ├─ Download tile pack (vector tiles)
   ├─ Progress: 0% → 100%
   └─ Store in app documents
   ↓
8. Download complete
   ├─ Success notification
   └─ "Offline Hazır" badge
   ↓
9. User can now go offline
```

**Süre**: ~30-60 saniye (tile pack boyutuna göre)

---

### 2.6 Aktif Sürüş Akışı (Active Trip - GPS Tracking)

```
[Mobile App]
1. User Trip Detail screen'de
   ↓
2. User taps "Sürüşe Başla"
   ↓
3. Location permission check
   ├─ Not granted → Permission request
   ├─ "When In Use" → OK
   └─ "Always" → Better (background tracking)
   ↓
4. GPS tracking başlar
   ├─ Foreground service start (Android)
   ├─ Background location updates (iOS)
   └─ Notification gösterilir: "Rotablo Aktif"
   ↓
5. Location updates (expo-location)
   ├─ Interval: 30 seconds (adaptive)
   ├─ Distance: 100 meters
   └─ Accuracy: Balanced
   ↓
6. Her location update'de:
   ├─ Current location store edilir (Zustand)
   ├─ Map center update edilir
   ├─ Distance traveled calculate edilir
   └─ Geofence check edilir
   ↓
7. Geofence check logic
   ```typescript
   for (const stage of selectedStages) {
     const distance = calculateDistance(
       currentLocation,
       stage.endPoint
     );
     
     if (distance < 500) { // 500m radius
       // Stage completion trigger
       showCompletionPrompt(stage);
     }
   }
   ```
   ↓
8. Side quest proximity check
   ```typescript
   for (const sideQuest of selectedSideQuests) {
     const distance = calculateDistance(
       currentLocation,
       sideQuest.anchorPoint
     );
     
     if (distance < 2000) { // 2km radius
       // Side quest notification
       showSideQuestNotification(sideQuest);
     }
   }
   ```
   ↓
9. Battery optimization
   ├─ Speed-based interval adjustment
   ├─ Stationary detection (pause tracking)
   └─ Low battery mode (reduce frequency)
   ↓
10. Offline mode
    ├─ Location updates continue
    ├─ Completions queue edilir (local)
    └─ Sync when online
```

**Süre**: Continuous (sürüş boyunca)

---

### 2.7 Etap Tamamlama Akışı (Stage Completion)

```
[Mobile App]
1. Geofence trigger (stage end point'e yaklaşıldı)
   ↓
2. Completion prompt gösterilir
   ├─ Modal: "Etap 3 tamamlandı mı?"
   ├─ Buttons: "Evet", "Hayır", "Sonra"
   └─ Auto-dismiss: 30 seconds
   ↓
3. User taps "Evet"
   ↓
4. Optimistic update (instant UI)
   ├─ Stage marked as completed (local state)
   ├─ Checkmark icon gösterilir
   └─ Progress bar update edilir
   ↓
5. Online check
   ├─ Online → API call
   └─ Offline → Queue'ye ekle
   ↓
[Online Path]
6. POST /api/completions
   {
     tripPlanId: "uuid",
     entityType: "stage",
     entityId: "uuid",
     completionSource: "gps",
     completedAt: "2026-04-09T12:00:00Z"
   }
   ↓
[Backend API]
7. Transaction başlar
   ↓
8. StageCompletion insert
   ↓
9. XP calculation
   ```typescript
   const baseXP = 100;
   const difficultyMultiplier = 1.0 + (stage.difficultyScore * 0.2);
   const sceneryBonus = stage.sceneryScore * 5;
   const distanceBonus = stage.distanceKm > 200 ? 20 : 0;
   
   const xp = baseXP * difficultyMultiplier + sceneryBonus + distanceBonus;
   // Example: 100 * 1.6 + 35 + 0 = 195 XP
   ```
   ↓
10. XpLedger insert
    ↓
11. Achievement check
    ```typescript
    // Check all achievement definitions
    for (const achievement of achievements) {
      if (achievement.scope === 'stage' && 
          achievement.stageId === completedStageId) {
        // Unlock achievement
        AchievementProgress.create({
          userId,
          achievementDefinitionId: achievement.id
        });
        
        // Add XP reward
        XpLedger.create({
          userId,
          amount: achievement.xpReward,
          reasonType: 'achievement_unlock'
        });
      }
    }
    
    // Check milestone achievements
    const completionCount = await StageCompletion.count({ userId });
    if (completionCount === 10) {
      // Unlock "İlk 10 Etap" achievement
    }
    ```
    ↓
12. Transaction commit
    ↓
13. Response: { 
      completion,
      xpEarned: 195,
      achievementsUnlocked: [...]
    }
    ↓
[Mobile App]
14. Achievement unlock animation
    ├─ Modal: "Yeni Başarım! 🏆"
    ├─ Badge gösterilir
    ├─ XP earned: +195
    └─ Confetti animation
    ↓
15. Local state update
    ├─ Completion confirmed
    ├─ XP total update
    └─ Achievement list update
    ↓
16. WatermelonDB sync
    ├─ Completion record insert
    ├─ Achievement record insert
    └─ XP ledger insert
    ↓
[Offline Path]
17. Completion queue'ye eklenir
    ```typescript
    SyncQueue.add({
      type: 'completion',
      payload: { ... },
      timestamp: Date.now(),
      status: 'pending'
    });
    ```
    ↓
18. UI update (optimistic)
    ├─ "Offline - Senkronize edilecek" badge
    └─ Completion marked locally
    ↓
19. Online olunca sync
    ├─ POST /api/completions/sync
    ├─ Batch sync (multiple completions)
    └─ Conflict resolution
```

**Süre**: 
- Online: ~500-1000ms
- Offline: ~100ms (instant UI)

---

### 2.8 Offline Sync Akışı (Background Sync)

```
[Mobile App]
1. App foreground'a gelir (veya network restore)
   ↓
2. Sync check trigger
   ├─ Pending operations var mı?
   └─ Network available mı?
   ↓
3. Sync queue read edilir (WatermelonDB)
   ```typescript
   const pendingOps = await SyncQueue.query(
     Q.where('status', 'pending'),
     Q.sortBy('timestamp', Q.asc)
   ).fetch();
   ```
   ↓
4. Batch sync request
   POST /api/completions/sync
   {
     operations: [
       {
         id: "local-uuid-1",
         type: "completion",
         payload: { ... },
         timestamp: 1617235200
       },
       {
         id: "local-uuid-2",
         type: "completion",
         payload: { ... },
         timestamp: 1617235300
       }
     ]
   }
   ↓
[Backend API]
5. Transaction başlar
   ↓
6. Her operation için:
   ├─ Duplicate check (timestamp + userId + entityId)
   ├─ Already exists → Skip
   └─ New → Process
   ↓
7. Completions insert (batch)
   ↓
8. XP calculate (batch)
   ↓
9. Achievements check (batch)
   ↓
10. Transaction commit
    ↓
11. Response: {
      synced: [
        { localId: "local-uuid-1", serverId: "uuid", status: "success" },
        { localId: "local-uuid-2", serverId: "uuid", status: "duplicate" }
      ],
      failed: [],
      totalXpEarned: 315
    }
    ↓
[Mobile App]
12. Sync queue update
    ├─ Success → Remove from queue
    ├─ Duplicate → Remove from queue
    └─ Failed → Retry later (exponential backoff)
    ↓
13. Local state update
    ├─ Server IDs update edilir
    ├─ XP total update edilir
    └─ Achievement list update edilir
    ↓
14. UI notification
    ├─ "Senkronizasyon tamamlandı"
    └─ "+315 XP kazandınız"
```

**Süre**: ~1-3 saniye (operation sayısına göre)

---

## 3. Background İşlemler (Background Jobs)

### 3.1 XP Calculation Worker

```
[BullMQ Worker]
1. Job queue'den alınır
   {
     type: 'calculate_xp',
     userId: 'uuid',
     completionId: 'uuid'
   }
   ↓
2. Completion data fetch edilir
   ↓
3. Stage/SideQuest data fetch edilir
   ↓
4. XP calculate edilir (formula)
   ↓
5. XpLedger insert
   ↓
6. User total XP update edilir
   ↓
7. Level check
   ├─ Current XP >= Next level threshold?
   └─ Yes → Level up notification
   ↓
8. Job complete
```

**Süre**: ~100-200ms per job

---

### 3.2 Achievement Check Worker

```
[BullMQ Worker]
1. Job queue'den alınır
   {
     type: 'check_achievements',
     userId: 'uuid',
     completionId: 'uuid'
   }
   ↓
2. User completion history fetch edilir
   ↓
3. Achievement definitions fetch edilir
   ↓
4. Her achievement için check
   ├─ Condition met?
   ├─ Already unlocked?
   └─ New unlock → AchievementProgress insert
   ↓
5. Unlocked achievements için
   ├─ XP reward add edilir
   └─ Push notification gönderilir
   ↓
6. Job complete
```

**Süre**: ~200-500ms per job

---

### 3.3 Sync Queue Worker

```
[BullMQ Worker]
1. Periodic job (her 15 dakika)
   ↓
2. Pending sync operations check edilir
   ├─ Database query: status = 'pending'
   └─ Older than 5 minutes
   ↓
3. Her operation için retry
   ├─ API call attempt
   ├─ Success → Status update: 'synced'
   └─ Failed → Retry count++
   ↓
4. Max retry exceeded (5 attempts)
   ├─ Status update: 'failed'
   └─ Admin notification
   ↓
5. Job complete
```

**Süre**: ~1-5 saniye (operation sayısına göre)

---

## 4. Kritik Akışlar (Critical Paths)

### 4.1 Cold Start Performance

**Target**: < 3 seconds (app launch to home screen)

**Optimization**:
1. Lazy load non-critical modules
2. Parallel initialization (DB, Auth, Maps)
3. Cache warm-up (hot data)
4. Code splitting (React Native)

---

### 4.2 Route Discovery Performance

**Target**: < 500ms (API response time)

**Optimization**:
1. Redis cache (1 hour TTL)
2. Database indexes (family, status)
3. Response pagination (limit 20)
4. CDN cache (static assets)

---

### 4.3 GPS Tracking Battery Impact

**Target**: < 10% battery drain per hour

**Optimization**:
1. Adaptive tracking frequency (speed-based)
2. Stationary detection (pause tracking)
3. Low battery mode (reduce frequency)
4. Efficient geofence checks (spatial index)

---

### 4.4 Offline Sync Reliability

**Target**: > 95% success rate

**Optimization**:
1. Retry logic (exponential backoff)
2. Conflict resolution (timestamp-based)
3. Duplicate detection (idempotency)
4. Queue persistence (WatermelonDB)

---

## 5. Error Handling & Recovery

### 5.1 Network Errors

```
[Mobile App]
1. API call fails (network error)
   ↓
2. React Query retry logic
   ├─ Retry 1: Immediate
   ├─ Retry 2: 1 second delay
   └─ Retry 3: 2 seconds delay
   ↓
3. All retries failed
   ├─ Offline mode activate
   ├─ Queue operation (if write)
   └─ Show cached data (if read)
   ↓
4. User notification
   ├─ Toast: "Bağlantı yok, offline moddasınız"
   └─ Offline indicator (status bar)
```

---

### 5.2 GPS Errors

```
[Mobile App]
1. GPS signal lost
   ↓
2. Last known location kullanılır
   ↓
3. User notification
   ├─ "GPS sinyali zayıf"
   └─ "Açık alanda deneyin"
   ↓
4. Tracking pause edilir (optional)
   ↓
5. GPS restore olunca
   ├─ Tracking resume edilir
   └─ Notification dismiss edilir
```

---

### 5.3 Database Errors

```
[Backend API]
1. Database query fails
   ↓
2. Error log edilir (Sentry)
   ↓
3. Transaction rollback
   ↓
4. Response: 500 Internal Server Error
   {
     error: {
       code: "DATABASE_ERROR",
       message: "Bir hata oluştu, lütfen tekrar deneyin"
     }
   }
   ↓
5. Client retry logic (React Query)
```

---

## 6. Monitoring & Observability

### 6.1 Key Metrics

**Backend**:
- API response time (p50, p95, p99)
- Error rate (%)
- Database query time
- Cache hit rate (%)
- Active connections

**Mobile**:
- App crash rate (%)
- GPS accuracy (meters)
- Battery drain (%/hour)
- Offline sync success rate (%)
- Screen load time (ms)

---

### 6.2 Alerting

**Critical Alerts** (PagerDuty/Slack):
- API error rate > 5%
- Database CPU > 80%
- App crash rate > 1%
- Sync failure rate > 10%

**Warning Alerts** (Email):
- API latency > 1s (p95)
- Cache hit rate < 80%
- GPS accuracy > 100m
- Battery drain > 15%/hour

---

## 7. Sonuç

Rotablo sistemi şu prensiplere göre çalışır:

1. **Offline-First**: Kullanıcı internet olmadan çalışabilir
2. **Optimistic UI**: Instant feedback, background sync
3. **Battery Efficient**: Adaptive tracking, smart geofencing
4. **Reliable Sync**: Retry logic, conflict resolution
5. **Observable**: Comprehensive monitoring, alerting

**Kritik Başarı Faktörleri**:
- Cold start < 3s
- API response < 500ms
- GPS battery drain < 10%/hour
- Offline sync success > 95%
