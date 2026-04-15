# Rotablo V1 Kilitli Kararlar

**Versiyon:** 2.4  
**Tarih:** 2026-04-12  
**Durum:** Kilitli

## Ozet Karar Matrisi

| # | Karar Alani | V1 Karari |
|---|-------------|-----------|
| 1 | Urun Kimligi | Editorial Route Publishing Platform + Pasif Companion |
| 2 | Route Authorship | Rotalari ekip uretir, kullanici yayinlanmis rotayi tuketir |
| 3 | Runtime RouteSession | `routeSession` tek runtime modeli; `active` / `incomplete` / `completed` |
| 4 | RouteSession Cogullugu | Ayni `userId + routeId` icin en fazla 1 acik `active` veya `incomplete` session |
| 5 | SideQuest Etkilesimi | SideQuest planning opsiyonel ve baglayici degil; listede ve haritada gorunur |
| 6 | Tamamlama | Manuel, GPS yok |
| 7 | Arac Profili | 6 alan zorunlu |
| 8 | Route Warnings | Statik, route trait tabanli, canli weather yok |
| 9 | Veri Girisi | Admin-first manuel giris, Excel sadece referans |
| 10 | Teknik Yigin | Supabase-first, custom backend later-if-needed |
| 11 | Maliyet Disiplini | Free-first, single-project-first, paid expansion later-if-needed |
| 12 | Icerik Kapsami | V1 Turkey only |
| 13 | Editorial Lifecycle | Review manuel checklist, publish/unpublish/archive yetkisi Admin/Owner'da |
| 14 | Progression Kapsami | Secondary; completion-first |

## Karar 1: Urun Kimligi

V1 = Editorial Route Publishing Platform + Pasif Companion.

## Karar 2: Route Authorship

Rotalar ekip tarafindan olusturulur ve publish edilir. Kullanici yayinlanmis rotayi inceler, routeSession baslatir ve bu route icindeki stage / sideQuest opsiyonlarini kullanir; yeni route tasarlamaz.

## Karar 3: Runtime RouteSession Modeli

Route ilerleme ve planning davranisi `routeSession` uzerinden yonetilir.

- start = yeni `active` session olusturmak veya `incomplete` session'i devam ettirmek
- route bitmeden cikilirsa session `incomplete` olur
- route tamamlanirsa session `completed` olur
- ayri `savedRoute` runtime nesnesi kullanilmaz

## Karar 4: RouteSession Cogullugu

V1'de ayni `userId + routeId` icin:

- en fazla 1 acik `active` veya `incomplete` session olabilir
- route tekrar acildiginda mevcut acik session tercih edilir
- ayni route icin paralel coklu acik session uretilmez

## Karar 5: SideQuest Etkilesimi

SideQuest'ler:

- host stage altinda listelenir
- statik haritada marker olarak gorunur
- kullanici tarafinda onceden planlanabilir
- ama planning baglayici degildir; acik session icinde degistirilebilir
- marker veya kart uzerinden Google Maps gibi dis navigasyon uygulamasina acilabilir

## Karar 6: Tamamlama

Tamamlama manueldir. `completionSource = manual` ve GPS dogrulama yoktur.

## Karar 7: Arac Profili

Uyumluluk motoru icin 6 alan zorunludur:

1. marka
2. model
3. govde tipi
4. cekis tipi
5. yerden yukseklik sinifi
6. lastik mevsimi

V1 arac profili capture flow'u ise su sekildedir:

1. marka sec
2. model sec
3. yil sec
4. lastik mevsimi sec
5. sistem `govde tipi`, `cekis tipi`, `yerden yukseklik sinifi` onerir
6. kullanici isterse bu teknik alanlari manuel override eder

Kurallar:

- canli Sahibinden veya benzeri bir entegrasyon yok
- kucuk curated vehicle reference dataset ile baslanir
- eslesme yoksa manuel fallback akisi acilir
- sistem kullaniciyi hizlandirir ama teknik alanlari zorla kilitlemez

## Karar 8: Route Warnings Sistemi

Rota uyarilari statiktir ve canli weather provider'a dayanmaz.

- uyarilar hazard trait'lerinden turetilir
- sistem bugunun hava durumunu degil, rotanin hangi kosullarda zorlasacagini anlatir
- yagmur, sis ve kar hassasiyeti statik route condition sensitivity olarak modellenir
- warning sistemi deterministic rule table olarak kurulur

## Karar 9: Veri Girisi

Admin-first manuel icerik girisi ana yoldur. Excel sadece referans kaynaktir.

## Karar 10: Teknik Yigin

V1 icin Supabase-first yaklasim izlenir.

- mobile: Expo React Native
- admin: Supabase Studio first, web admin second
- backend platform: Supabase
- warning logic: app/shared TypeScript veya basit service logic

## Karar 11: Maliyet Disiplini

V1 `free-first` ve `single-project-first` mantigiyla kurulur.

- ilk pilotta tek Supabase projesi kullanilir
- staging / production ayrimi erken fazda zorunlu degildir
- Studio yetmeden ozel admin web acilmaz
- agir media, live weather ve custom backend pilot deger kanitlanmadan acilmaz
- hibe veya kredi imkanlari bonus kabul edilir; plan bunlara dayanmaz

## Karar 12: Icerik Kapsami

V1 = Turkey only.

## Karar 13: Editorial Lifecycle ve Yetki

Review manuel checklist'tir; V1'de ayri `in_review` status'u yoktur.

- `draft -> published`
- `published -> draft` = unpublish
- `draft|published -> archived`
- Editor draft uretir, duzenler, siralar ve preview eder
- Admin/Owner publish, unpublish ve archive eder
- unpublished veya archived route icin yeni session olusturulmaz
- mevcut routeSession sahipleri en son published icerigi read-only gorur

## Karar 14: Progression Kapsami

V1'de progression secondary'dir. Completion-first yaklasimi izlenir.

## Sonuc

V1 artik "editorial publishing + routeSession + static route warnings + passive companion" odaklidir ve bunu minimum operasyonel maliyetle yapmayi hedefler.
