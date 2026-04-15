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

- Status: `done`
- Goal: admin ve public kullanimi ayirmak
- Output: minimum auth + RLS kararlari ve uygulamasi
- Acceptance:
  - admin/editorial veri girisi korumali olmali
  - published route'lar public okunabilir olmali
  - unpublished veya archived route'lar katalogda gorunmemeli
  - mevcut routeSession sahipleri unpublished/archived route'u read-only gorebilmeli

## Phase 2 - Editorial Bootstrap

### T4. Manual content entry path

- Status: `done`
- Goal: Supabase Studio ile bir pilot route girilebilsin
- Output: 1 route + stage'leri + sideQuest'leri + hazardProfile'lari + operasyonel veri giris runbook'u
- Acceptance:
  - en az 1 route publish edilebilir durumda olmali
  - ordered stage list girilebilmeli
  - sideQuest orderIndex dogru girilebilmeli
  - sideQuest type ve koordinat bilgisi girilebilmeli
  - hazard trait seti warning preview uretmeye yeterli olmali
  - veri giris sirasi ve minimum checklist `docs/Rotablo_Pilot_Content_Entry_Runbook_v1.md` ile netlesmis olmali

Not:

- `R01` normalize edilmis CSV paketi ve import migration'i ile Supabase'e girildi
- import kaynaklari: `supabase/imports/r01/route_pack.json`, `scripts/imports/normalize-pilot-route-r01.mjs` ve `docs/Rotablo_R01_Normalization_Notes_v1.md`

### T5. Publish validation path

- Status: `done`
- Goal: publish checklist'i app/service logic'te enforce etmek
- Output: publish oncesi validation
- Acceptance:
  - eksik stage veya hazard profile varsa publish bloklanmali
  - validation mesajlari anlasilir olmali
  - unpublish = `published -> draft` ve archive = `draft|published -> archived` davranislari dogrulanmali
  - unpublished/archived route icin yeni session acilamamali
  - DB trigger zorunlu olmamali

Not:

- `validate_route_publishability(route_id)` fonksiyonu publish-oncesi issue listesini dondurur
- `transition_route_status(route_id, next_status)` fonksiyonu admin-only lifecycle gecisini ve child status cascade'ini yonetir
- migration self-check'i `R01` icin publish validation issue donmedigini dogruladi

## Parallel Follow-Ups

### Hemen Yapilmali

- `R01` admin lifecycle fonksiyonu ile `published` duruma alinmali; `T6` katalogu yalnizca published route okur.

### T6-T7 Sirasinda Paralel Ele Alinabilir

- `route`, `stage`, `side_quest` ve `hazard_profile` icin `created_at` / `updated_at` alanlari eklenmeli.
- `heroAssetId` / `mediaAsset` gibi deferred alanlar doc-schema farki yaratmayacak sekilde acikca `later` olarak isaretlenmeli.
- `validate_route_publishability()` kapsami stage sequence, planlanan stage sayisi ve toplam mesafe gibi editorial tutarlilik kontrolleriyle genisletilebilir.
- Archive / unpublish sonrasi mevcut session sahibi icin aciklayici read-only UX mesaji `T7-T9` akisinda yazilmali.
- R01 importundaki ham metin cilalari (`Elite` gibi cift tirnak kacislari) UI'a tasinmadan temizlenmeli.

### Route 2'den Once Netlesmeli

- `selectedStageIds` ve `plannedSideQuestIds` icindeki stale UUID'ler icin temizleme / ignore stratejisi dokumante edilmeli.
- CSV -> normalized pack -> import akisi `R01`e ozel olmaktan cikarilip ikinci route icin tekrar kullanilabilir hale getirilmeli.

## Phase 3 - Public Consumption

### T6. Mobile route catalog

- Status: `done`
- Goal: published route listesi gostermek
- Output: katalog ekrani
- Acceptance:
  - sadece published route'lar gorunmeli
  - route name, summary, origin, destination, distance gosterilmeli

Not:

- `R01` `20260414234500_t6_publish_r01.sql` migration'i ile published duruma alindi
- katalog ekrani mock yerine Supabase REST uzerinden published route listesi okur
- `mobile/.env.example` Expo public Supabase degiskenlerini tanimlar

### T7. Mobile route detail

- Status: `done`
- Goal: published route detayini gostermek
- Output: route detail ekrani
- Acceptance:
  - ordered stage list render olmali
  - sideQuest listeleri host stage altinda gorunmeli
  - statik harita uzerinde sideQuest marker'lari gorunmeli
  - sideQuest karti veya marker'i ile `Google Maps ile ac` handoff'u calismali
  - statik route metadata okunabilir olmali

Not:

- catalog kartlari artik `RouteDetail` ekranina navigate eder
- detail fetch'i published route, ordered stage ve host-stage side quest hiyerarsisini Supabase REST uzerinden okur
- marker paneli canli navigasyon degil, side quest koordinatlarindan uretilen statik marker gorunumudur

### T8. Vehicle profile CRUD

- Status: `done`
- Goal: kullanici hibrit picker + manual override ile arac profilini olusturabilsin
- Output: create / edit / select flow, curated vehicle reference lookup, manual fallback
- Acceptance:
  - kullanici `marka -> model -> yil -> lastik` akisiyla ilerleyebilmeli
  - sistem `bodyType`, `drivetrain`, `groundClearanceClass` icin ilk oneriyi uretebilmeli
  - kullanici onerilen teknik alanlari manuel override edebilmeli
  - curated dataset disindaki araclar icin manual fallback akisi olmali
  - create / edit / select davranisi tek Garage ekraninda calisiyor olmali
  - auth-backed persistence acilana kadar local garage state ile test edilebilmeli
  - secili profil routeSession olustururken kullanilabilmeli

Not:

- mobil Garage ekrani artik local curated dataset + manual fallback ile calisiyor
- auth-backed Supabase persistence, routeSession create akisi acildiginda ayni profile modeline baglanacak

### T9. RouteSession start/resume and planning flow

- Status: `done`
- Goal: kullanici routeSession baslatabilsin, devam edebilsin ve sideQuest planini yonetebilsin
- Output: `routeSession` create + status transition + planning state
- Acceptance:
  - ilk companion girisinde session `active` olusabilmeli
  - cikis / ara verme sonrasi session `incomplete` olabilmeli
  - mevcut `incomplete` session tekrar `active` yapilabilmeli
  - `selectedStageIds` ve `plannedSideQuestIds` session'a baglanabilmeli
  - planned sideQuest'ler acik session icinde sonradan degistirilebilmeli
  - ayni `userId + routeId` icin birden fazla acik `active` veya `incomplete` session uretilmemeli

Not:

- current mobile implementation routeSession state'ini local store uzerinde tutar
- Route detail ekrani session baslatma, ara verme, resume, complete ve planning kontrolunu birlikte verir
- Session tab, active / incomplete / completed oturumlarin kisa operasyon paneli olarak calisir

## Phase 4 - Route Warnings and Compatibility

### T10. General route warning derivation

- Status: `done`
- Goal: route, stage ve sideQuest hazard trait'lerinden genel route warning kartlari uretmek
- Output: route warning summary logic
- Acceptance:
  - ayni input ayni outputu vermeli
  - ruleCode bazli standard kartlar uretilmeli
  - severity sirasi korunmali

Not:

- route, stage ve planned sideQuest kapsami icin deterministic rule engine mobil istemci tarafinda calisir
- session yoksa warning ozetleri tum published route kapsami icin uretilir
- acik session varsa warning kapsami secili etaplar ve planli side quest'lere daralir

### T11. Vehicle compatibility warnings

- Status: `done`
- Goal: secili arac profiline gore uyumluluk uyarisi uretmek
- Output: vehicle compatibility warning logic
- Acceptance:
  - `groundClearanceClass`, `drivetrain`, `tireSeason` kullanilmali
  - advisory copy route'u yasaklamamali
  - ayni profil + ayni route ayni warning setini vermeli

Not:

- acik session varsa vehicle compatibility, session'a bagli profile gore hesaplanir
- session yoksa secili Garage profili route detail ekraninda compatibility warning uretmek icin kullanilir

### T12. Warnings UI

- Status: `done`
- Goal: route detail veya routeSession ekraninda warning kartlarini gostermek
- Output: route warnings bolumu
- Acceptance:
  - genel rota uyarilari gorunmeli
  - secili arac varsa vehicle compatibility uyarilari gorunmeli
  - warning kartlari severity sirasiyla listelenmeli

Not:

- warning kartlari route detail ekraninda session panelinin hemen altinda gosterilir
- kartlar `high > caution > info` sirasini korur
- her kart rule code, advisory copy ve kaynak ozetini tasir

## Phase 5 - Completion and Budget

### T13. Manual completion flow

- Status: `done`
- Goal: stage ve sideQuest completion islemek
- Output: completion UI
- Acceptance:
  - entityType `stage|sideQuest` ile completion yazilabilmeli
  - gerekli stage'ler tamamlaninca route tamamla butonu gorunmeli

Not:

- route detail ekrani artik acik session icinde stage ve sideQuest completion toggle'lari tasir
- route tamamlama gecisi, secili stage'ler tamamlanmadan acilmaz
- completion kayitlari lokal runtime state'te `completionSource = manual` mantigiyla tutulur

### T14. Budget scenario flow

- Status: `done`
- Goal: estimate bazli butce simulasyonu
- Output: budgetScenario create/edit/use

Acceptance:
  - oturum bazli butce senaryosu create / edit davranisi calisiyor olmali
  - yakit, tuketim, konaklama ve yeme icme girdilerinden tahmini toplam uretilmeli
  - budget senaryosu acik session'a baglanabilmeli

Not:

- current mobile implementation butce senaryosunu Session tab icinde local state ile tutar
- hesap route ana km'si uzerinden yapilir; side quest etkisi sonraki iterasyonda derinlestirilebilir
- Acceptance:
  - yakit, konaklama, yemek girdileri kullanilabilmeli
  - route estimate ve sideQuest etkisi gosterilebilmeli

## Phase 6 - Deferred

- `later`: admin web
- `later`: progression / XP / achievement
- `later`: media workflow
- `later`: Excel import yardimcilari
- `later`: live weather multiplier
