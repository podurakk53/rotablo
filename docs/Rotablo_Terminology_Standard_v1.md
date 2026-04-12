# Rotablo Terminology Standard v1

**Durum:** Guncel terim sozlugu  
**Tarih:** 2026-04-12

## 1. Amac

Bu dokuman, ayni kavramin farkli dosyalarda farkli isimlerle anilmasini engellemek icin vardir.

## 2. Icerik Terimleri

- `route`: yayinlanabilir editorial backbone
- `route family`: `main` | `bypass` | `connector`
- `stage`: route icindeki ordered primary driving unit
- `sideQuest`: bir stage'e bagli opsiyonel detour; route family uyesi degildir
- `hazardProfile`: yol karakteri ve kosul hassasiyeti trait seti
- `route warning`: route/stage/sideQuest hazard trait'lerinden turetilen genel advisory kart
- `static route map`: route detail veya session ekraninda sideQuest marker'larini gosteren, navigasyon olmayan harita

## 3. Runtime Terimleri

- `routeSession`: route ilerleme ve planlama icin tek runtime nesnesi
- `start`: yeni session acmak veya mevcut `incomplete` session'i `active` yapmak
- `incomplete`: kullanici route'u bitirmeden ayrildiginda kalan acik session
- `complete route`: gerekli stage'ler tamamlaninca kullanicinin routeSession'i `completed` yapmasi
- `planned sideQuest`: kullanicinin onceden isaretledigi opsiyonel sideQuest; baglayici degildir
- `external navigation handoff`: sideQuest marker veya kartindan Google Maps gibi dis navigasyon uygulamasina gecis

## 4. Lifecycle Terimleri

- `draft`: henuz public olmayan editorial icerik
- `published`: public katalogda gorulebilen icerik
- `unpublish`: `published -> draft`
- `archived`: katalogdan cekilen ve yeni kullanima acilmayan icerik
- `review`: manuel checklist; V1'de ayri status degildir

## 5. Warning Terimleri

- `static route warning`: canli provider verisi degil, editorial trait setinden uretilen uyari
- `condition sensitivity`: rotanin yagmur, sis, kar gibi kosullarda zorlasma egilimi
- `vehicle compatibility warning`: secili araca gore uretilen advisory kopya
- `deterministic rule system`: ayni inputta ayni cikti ureten kural tablosu
- `advisory warning`: risk bilgisidir, yasak koymaz
- `severity`: `info` | `caution` | `high`

## 6. Kullanilmamasi Gereken Eski Terimler

- `tripPlan`
- `tripSelection`
- `savedRoute`
- `save`
- `weatherCheckpoint`
- `weatherRiskEvaluation`
- `weather refresh`
- `connection`
- `routeFamily = sideQuest`
- `active` route content status
