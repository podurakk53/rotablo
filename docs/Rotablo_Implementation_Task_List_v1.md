# Rotablo Implementation Task List v1

**Durum:** Aktif uygulama sirasi  
**Tarih:** 2026-04-12

## Status Key

- `done`: tamamlandi
- `next`: sonraki kritik is
- `later`: sonraya birakildi

## Phase 0 - Documentation Cleanup

| Task | Status | Output |
|---|---|---|
| Archive workspace-level historical docs | `done` | `../docs-archive/` |
| Leave a pointer in workspace `docs/` | `done` | `../docs/README.md` |
| Rewrite stale `context-pack` files | `done` | `context-pack/*.md` |
| Lock `routeSession`-only runtime model | `done` | canonical docs updated |
| Replace live weather direction with static route warnings | `done` | product + model + warning docs updated |
| Lock editorial lifecycle and minimum permissions | `done` | workflow + locked decisions updated |

## Phase 1 - Platform Bootstrap

## Cross-Phase Cost Guardrails

- Baslangic yolu `free-first` olmalidir.
- Ilk pilotta tek Supabase projesi kullanilir.
- Staging / production ayrimi erken fazda zorunlu degildir.
- Ozel admin web, ancak Studio gercekten yetersiz kalirsa acilir.
- Agir medya, live provider ve ek ucretli servisler pilot deger kanitlanmadan acilmaz.
- Hibe veya kredi varsa bonus kabul edilir; temel plan bunlara dayanmaz.

### T1. Supabase project bootstrap

- Status: `done`
- Goal: tek Supabase projesi ve temel env yapisini kurmak
- Output: linked project, local env names, auth path selected, cost guardrails applied
- Acceptance:
  - Supabase project olusmus olmali
  - ilk kurulum tek Supabase projesiyle sinirli olmali
  - repo icinde env anahtarlari isimlendirilmis olmali
  - admin auth yontemi `Supabase Auth email/password` olarak secilmis olmali
  - ucretli plan veya kredi varsayimina dayali zorunlu kurulum olmamali

### T2. Core schema migration

- Status: `done`
- Goal: canonical modelin V1-core tablolarini olusturmak
- Output: `route`, `stage`, `sideQuest`, `hazardProfile`, `vehicleProfile`, `routeSession`, `stageCompletion`, `budgetScenario`
- Acceptance:
  - tablo ve enum adlari canonical docs ile uyumlu olmali
  - `routeSession` start / incomplete / completed modeli calisiyor olmali
  - `savedRoute` tablosu olmamali
  - ayni `userId + routeId` icin birden fazla acik `active` veya `incomplete` session uretilmemeli

### T3. Basic auth and RLS

- Status: `next`
- Goal: admin ve public kullanimi ayirmak
- Output: minimum auth + RLS kararlari ve uygulamasi
- Acceptance:
  - admin/editorial veri girisi korumali olmali
  - published route'lar public okunabilir olmali
  - unpublished veya archived route'lar katalogda gorunmemeli

## Phase 2 - Editorial Bootstrap

### T4. Manual content entry path

- Status: `next`
- Goal: Supabase Studio ile bir pilot route girilebilsin
- Output: 1 route + stage'leri + sideQuest'leri + hazardProfile'lari
- Acceptance:
  - en az 1 route publish edilebilir durumda olmali
  - ordered stage list girilebilmeli
  - sideQuest orderIndex dogru girilebilmeli
  - sideQuest type ve koordinat bilgisi girilebilmeli
  - hazard trait seti warning preview uretmeye yeterli olmali

### T5. Publish validation path

- Status: `next`
- Goal: publish checklist'i app/service logic'te enforce etmek
- Output: publish oncesi validation
- Acceptance:
  - eksik stage veya hazard profile varsa publish bloklanmali
  - validation mesajlari anlasilir olmali
  - unpublish = `published -> draft` ve archive = `draft|published -> archived` davranislari dogrulanmali
  - unpublished/archived route icin yeni session acilamamali
  - DB trigger zorunlu olmamali

## Phase 3 - Public Consumption

### T6. Mobile route catalog

- Status: `next`
- Goal: published route listesi gostermek
- Output: katalog ekrani
- Acceptance:
  - sadece published route'lar gorunmeli
  - route name, summary, origin, destination, distance gosterilmeli

### T7. Mobile route detail

- Status: `next`
- Goal: published route detayini gostermek
- Output: route detail ekrani
- Acceptance:
  - ordered stage list render olmali
  - sideQuest listeleri host stage altinda gorunmeli
  - statik harita uzerinde sideQuest marker'lari gorunmeli
  - sideQuest karti veya marker'i ile `Google Maps ile ac` handoff'u calismali
  - statik route metadata okunabilir olmali

### T8. Vehicle profile CRUD

- Status: `next`
- Goal: kullanici 6 alanli arac profilini olusturabilsin
- Output: create / edit / select flow
- Acceptance:
  - 6 zorunlu alan validate edilmeli
  - secili profil routeSession olustururken kullanilabilmeli

### T9. RouteSession start/resume and planning flow

- Status: `next`
- Goal: kullanici routeSession baslatabilsin, devam edebilsin ve sideQuest planini yonetebilsin
- Output: `routeSession` create + status transition + planning state
- Acceptance:
  - ilk companion girisinde session `active` olusabilmeli
  - cikis / ara verme sonrasi session `incomplete` olabilmeli
  - mevcut `incomplete` session tekrar `active` yapilabilmeli
  - `selectedStageIds` ve `plannedSideQuestIds` session'a baglanabilmeli
  - planned sideQuest'ler acik session icinde sonradan degistirilebilmeli
  - ayni `userId + routeId` icin birden fazla acik `active` veya `incomplete` session uretilmemeli

## Phase 4 - Route Warnings and Compatibility

### T10. General route warning derivation

- Status: `next`
- Goal: route, stage ve sideQuest hazard trait'lerinden genel route warning kartlari uretmek
- Output: route warning summary logic
- Acceptance:
  - ayni input ayni outputu vermeli
  - ruleCode bazli standard kartlar uretilmeli
  - severity sirasi korunmali

### T11. Vehicle compatibility warnings

- Status: `next`
- Goal: secili arac profiline gore uyumluluk uyarisi uretmek
- Output: vehicle compatibility warning logic
- Acceptance:
  - `groundClearanceClass`, `drivetrain`, `tireSeason` kullanilmali
  - advisory copy route'u yasaklamamali
  - ayni profil + ayni route ayni warning setini vermeli

### T12. Warnings UI

- Status: `next`
- Goal: route detail veya routeSession ekraninda warning kartlarini gostermek
- Output: route warnings bolumu
- Acceptance:
  - genel rota uyarilari gorunmeli
  - secili arac varsa vehicle compatibility uyarilari gorunmeli
  - warning kartlari severity sirasiyla listelenmeli

## Phase 5 - Completion and Budget

### T13. Manual completion flow

- Status: `later`
- Goal: stage ve sideQuest completion islemek
- Output: completion UI
- Acceptance:
  - entityType `stage|sideQuest` ile completion yazilabilmeli
  - gerekli stage'ler tamamlaninca route tamamla butonu gorunmeli

### T14. Budget scenario flow

- Status: `later`
- Goal: estimate bazli butce simulasyonu
- Output: budgetScenario create/edit/use
- Acceptance:
  - yakit, konaklama, yemek girdileri kullanilabilmeli
  - route estimate ve sideQuest etkisi gosterilebilmeli

## Phase 6 - Deferred

- `later`: admin web
- `later`: progression / XP / achievement
- `later`: media workflow
- `later`: Excel import yardimcilari
- `later`: live weather multiplier
