# Rotablo Canonical Data Model v0

**Durum:** Guncel planlama modeli  
**Tarih:** 2026-04-12

## 1. Amac

Bu dokuman Rotablo'nun guncel urun yonunu veri modeline cevirir.

Ana hedef:

- editorial route authoring sistemini modellemek
- public route consumption'u modellemek
- `routeSession` tabanli runtime davranisini netlestirmek
- statik rota uyarilari ve arac uyumlulugunu desteklemek

## 2. Modelleme Ilkeleri

1. Icerik kuratorludur; kullanici tarafindan serbest uretilmez.
2. Route authoring ve public consumption ayri ihtiyaclardir.
3. Uyarilar trait ve kural tabanli olmalidir.
4. Sistem canli weather provider'a bagimli olmadan calisabilmelidir.
5. Route ilerleme ve planning icin tek runtime nesnesi `routeSession` olmalidir.
6. Excel referans olabilir; modelin kaynagi degildir.

## SQL Notu

Canonical dokuman entity isimlerini urun diliyle yazar. Fiziksel PostgreSQL semasi ise snake_case kullanir.

Ornek:

- `sideQuest` -> `side_quest`
- `hazardProfile` -> `hazard_profile`
- `vehicleProfile` -> `vehicle_profile`
- `routeSession` -> `route_session`
- `stageCompletion` -> `stage_completion`

Auth ve RLS icin `app_user_role` gibi yardimci SQL tablolar bulunabilir. Bunlar urunun core entity setinin parcasi degil, implementation destek katmanidir.

## 3. Veri Katmanlari

### A. Editorial content

- `route`
- `stage`
- `sideQuest`
- `hazardProfile`
- `mediaAsset` optional

### B. Derived system data

- `routeWarningSummary`
- `warningMatch`
- `routeStats` optional

### C. User / runtime data

- `vehicleProfile`
- `routeSession`
- `budgetScenario`
- `stageCompletion`

## 4. Editorial Content Nesneleri

## 4.1 `route`

### Temel alanlar

- `id`
- `code`
- `slug`
- `name`
- `family` = `main` | `bypass` | `connector`
- `summary`
- `description`
- `originLabel`
- `destinationLabel`
- `isLoop`
- `countrySet`
- `regionSet`
- `plannedStageCount`
- `plannedDistanceKm`
- `status` = `draft` | `published` | `archived`
- `sortOrder`
- `heroAssetId` nullable
- `publishedAt` nullable
- `revisionNumber`

### Notlar

- route, kullanici tarafindan olusturulmaz
- public gorunurluk icin esas durum `published` olmalidir

## 4.2 `stage`

### Temel alanlar

- `id`
- `routeId`
- `code`
- `slug`
- `sequenceIndex`
- `dayNumber` nullable
- `dayLabel` nullable
- `title`
- `originLabel`
- `destinationLabel`
- `summary`
- `distanceKm`
- `estimatedDriveMinutes` nullable
- `difficultyScore`
- `sceneryScore`
- `questTags`
- `primaryVisitName` nullable
- `primaryVisitSummary` nullable
- `detourAnchorName` nullable
- `detourKm` default `0`
- `surfaceType` nullable
- `roadCharacter` nullable
- `lodgingOptions` nullable
- `foodOptions` nullable
- `hazardProfileId`
- `status` = `draft` | `published` | `archived`

## 4.3 `sideQuest`

### Temel alanlar

- `id`
- `hostStageId`
- `hostRouteId`
- `code`
- `slug`
- `orderIndex`
- `name`
- `type` = `gastronomy` | `viewpoint` | `natureSpot` | `ancientSite` | `driveSegment` | `townStop`
- `stopStyle` = `stop` | `drive`
- `summary`
- `distanceKm`
- `detourKm`
- `detourAnchorName`
- `latitude`
- `longitude`
- `difficultyScore`
- `sceneryScore`
- `questTags`
- `hazardProfileId`
- `status` = `draft` | `published` | `archived`

### Notlar

- sideQuest, route family uyesi degildir
- ayni stage altinda `orderIndex` ile siralanir
- haritada gosterilecek sideQuest'ler koordinat tasir
- sideQuest karti veya marker'i dis navigasyon uygulamasina handoff icin kullanilabilir

## 4.4 `hazardProfile`

### Temel alanlar

- `id`
- `lowClearanceRisk` boolean
- `roughSurfaceRisk` boolean
- `highAltitudeRisk` boolean
- `narrowRoadRisk` boolean
- `steepGradeRisk` boolean
- `hairpinDensity` = `low` | `medium` | `high`
- `rainSensitive` boolean
- `fogSensitive` boolean
- `snowSensitive` boolean
- `remoteAccessRisk` boolean
- `fatigueLoad` = `low` | `medium` | `high`
- `notes` nullable

### Notlar

- stage ve sideQuest'ler serbest metin warning yerine trait setine baglanir
- route warning kopyasi bu trait'lerden turetilir

## 5. Derived Data Nesneleri

## 5.1 `routeWarningSummary`

### Temel alanlar

- `routeId`
- `generalWarningItems`
- `vehicleCompatibilityItems` optional

### Notlar

- kalici kayit olmak zorunda degildir
- route detail veya routeSession ekraninda on-the-fly uretilebilir

## 5.2 `warningMatch`

### Temel alanlar

- `ruleCode`
- `severity` = `info` | `caution` | `high`
- `sourceScope` = `route` | `stage` | `sideQuest`
- `sourceId`
- `triggerTraits`
- `message`

## 6. Runtime Nesneleri

## 6.1 `vehicleProfile`

### Temel alanlar

- `id`
- `userId`
- `brand`
- `model`
- `modelYear` nullable
- `bodyType`
- `drivetrain`
- `groundClearanceClass`
- `tireSeason`
- `referenceVehicleKey` nullable
- `isPrimary`

### Enumlar

- `bodyType`: `sedan` | `suv` | `hatchback` | `coupe` | `convertible`
- `drivetrain`: `fwd` | `rwd` | `awd` | `4wd`
- `groundClearanceClass`: `low` | `medium` | `high`
- `tireSeason`: `summer` | `allSeason` | `winter`

### Notlar

- Uyumluluk motoru acisindan cekirdek alanlar yine `brand`, `model`, `bodyType`, `drivetrain`, `groundClearanceClass`, `tireSeason` setidir.
- `modelYear`, lookup ve otomatik teknik alan onerisi icin kullanilan yardimci alandir.
- `referenceVehicleKey`, secim curated vehicle reference dataset uzerinden geldiyse opsiyonel olarak saklanabilir.
- Kullanici `bodyType`, `drivetrain` ve `groundClearanceClass` alanlarini sistem onerisine ragmen manuel override edebilir.

## 6.2 `routeSession`

### Temel alanlar

- `id`
- `userId`
- `routeId`
- `vehicleProfileId`
- `budgetScenarioId` nullable
- `status` = `active` | `incomplete` | `completed`
- `startedAt` nullable
- `completedAt` nullable
- `activeStageId` nullable
- `selectedStageIds` nullable
- `plannedSideQuestIds` nullable

### Notlar

- ayri `savedRoute` runtime nesnesi yoktur
- routeSession ilk companion girisinde `active` olarak acilir
- kullanici route'u bitirmeden ayrilirsa session `incomplete` olur
- kullanici `incomplete` session'a geri donerse session tekrar `active` olabilir
- `selectedStageIds` ve `plannedSideQuestIds` V1'de basit array/json olarak tutulabilir; referential integrity app/service katmaninda korunur
- `plannedSideQuestIds` planlama yardimcisidir; baglayici degildir
- kullanici acik session icinde sideQuest planini degistirebilir ve planlamadigi bir sideQuest'i yine tamamlayabilir
- ayni `userId + routeId` icin en fazla 1 acik `active` veya `incomplete` session olabilir
- route unpublished veya archived olursa mevcut session read-only gorunur; yeni session olusturulmaz
- V1'de routeSession per-session revision snapshot tutmaz; yayinlanmis icerik en son published revizyona gore okunur

## 6.3 `budgetScenario`

### Temel alanlar

- `id`
- `userId`
- `name`
- `fuelPriceTlPerLiter`
- `consumptionLitersPer100Km`
- `lodgingTier`
- `lodgingDailyTl`
- `foodDailyTl`
- `currency`

## 6.4 `stageCompletion`

### Temel alanlar

- `id`
- `userId`
- `routeSessionId`
- `entityType` = `stage` | `sideQuest`
- `entityId`
- `completionSource` = `manual`
- `completedAt`
- `notes` nullable

### Notlar

- route-level completion butonu, secili stage'ler varsa onlar; yoksa route'un gerekli stage'leri tamamlandiginda ve kullanici onay verdiginde `routeSession.status = completed` gecisini tetikler

## 7. V1 Davranis Kararlari

- `routeSession`, `tripPlan`'in yerini alir
- route warnings canli hava sorgusu kullanmaz
- review manuel checklist'tir
- advisory warning, yasak koymaz
- sideQuest planning baglayici degildir; kullanici acik session icinde fikrini degistirebilir

## 8. V1 Core vs Deferred

### V1 core

- route: `name`, `family`, `summary`, `originLabel`, `destinationLabel`, `status`, `sortOrder`
- stage: `sequenceIndex`, `title`, `originLabel`, `destinationLabel`, `summary`, `distanceKm`, `hazardProfileId`
- sideQuest: `hostStageId`, `orderIndex`, `name`, `type`, `stopStyle`, `summary`, `distanceKm`, `latitude`, `longitude`, `hazardProfileId`
- hazardProfile: tum statik risk ve kosul hassasiyeti alanlari
- vehicleProfile: tum 6 zorunlu alan
- routeSession: `routeId`, `vehicleProfileId`, `status`, `selectedStageIds`, `plannedSideQuestIds`
- stageCompletion: `entityType`, `entityId`, `completedAt`

### Deferred / nice-to-have

- `mediaAsset`
- `dayNumber`, `dayLabel`
- `estimatedDriveMinutes`
- `primaryVisitName`, `primaryVisitSummary`
- `lodgingOptions`, `foodOptions`
- detayli `routeStats`
- kalici `routeWarningSummary`

## 9. Publish Icin Minimum Veri

Bir route publish edilmeden once en az su bilesenler hazir olmalidir:

- route name, summary, family, origin, destination
- en az bir stage
- her stage icin title, origin, destination, summary, distance ve hazard profile
- sideQuest varsa host stage, orderIndex, type, summary, koordinat ve hazard profile
- route status = `published`
