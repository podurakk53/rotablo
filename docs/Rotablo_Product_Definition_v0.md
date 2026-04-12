# Rotablo Product Definition v0

**Durum:** Guncel planlama tanimi  
**Tarih:** 2026-04-12

## 1. Urun Ozeti

Rotablo, otomobil tutkunlari icin tasarlanmis kuratorlu bir rota yayinlama platformu ve pasif driving companion urunudur.

V1'de:

- Rotablo ekibi route author olarak icerik uretir
- kullanici yayinlanmis rotalari kesfeder
- kullanici arac profilini secer
- kullanici route icin bir `routeSession` baslatir ve gerekiyorsa sonra devam eder
- sistem statik rota uyarilari ve arac uyumlulugu uretir

V1'de Rotablo:

- serbest rota olusturucu degildir
- turn-by-turn navigator degildir
- live weather urunu degildir
- background GPS veya live-tracking urunu degildir

## 2. Problem

Mevcut harita ve navigasyon urunleri:

- surus deneyimini urunun merkezi olarak ele almiyor
- arac tipine gore aciklanabilir zorluk bilgisi sunmuyor
- rota kurasyonu yapan ekipler icin tekrar uretilebilir bir authoring sistemi vermiyor

Rotablo bu boslugu editorial publishing + passive companion modeliyle kapatir.

## 3. Urun Ilkeleri

1. Yol sadece ulasim degil, deneyimdir.
2. V1'de rota yazari sizsiniz; kullanici yayinlanmis rotayi tuketir.
3. Uyarilar deterministic ve aciklanabilir olmalidir.
4. Sistem kullanici adina "gitme / yapma" karari vermez.
5. Sistem bugunun hava durumunu degil, rotanin hangi kosullarda zorlasacagini anlatir.
6. Teknik yigin urun gercegine hizmet etmelidir.
7. Excel yardimci olabilir, urunun anlama modeli degildir.

## 4. Ana Roller

### Admin / Editor

- route draft olusturur
- stage ve sideQuest tanimlar
- hazard trait'lerini belirler
- rota uyarilarini preview eder
- route'u publish eder, revize eder

### Public User

- yayinlanmis rotalari kesfeder
- arac profilini olusturur veya secer
- route detaylarini inceler
- routeSession baslatir veya devam eder
- yol karakteri, kosul hassasiyeti ve arac uyumlulugu temelli advisory warnings gorur
- completion kayitlarini manuel isler

## 5. Urun Cekirdegi

Rotablo'nun V1 cekirdegi bes parcadan olusur:

### 5.1 Editorial Route System

Admin tarafindan yonetilen:

- `route`
- `stage`
- `sideQuest`
- `hazardProfile`

### 5.2 Public Route Consumption

Kullanici:

- yayinlanmis route'u goruntuler
- ordered stage list'i inceler
- sideQuest'leri listede ve statik haritada gorur
- statik route metadata'yi okur

### 5.3 Runtime Route Session

Kullanici route ile aktif iliskiyi `routeSession` uzerinden kurar:

- `active`
- `incomplete`
- `completed`

V1'de save/start icin ayri bir `savedRoute` modeli yoktur. Kullanici route'u bitirmeden ayrilirsa session `incomplete` olur; geri dondugunde yeniden `active` olabilir.

### 5.4 Deterministic Warning Layer

Warning sistemi uc veriyi birlestirir:

- arac profili
- stage / sideQuest hazard trait'leri
- rota kosul hassasiyetleri

Bu katman smart engine degildir. Kural tabanlidir.

### 5.5 Companion Layer

V1 companion katmani sunlari kapsar:

- rota uyarilari
- arac uyumlulugu
- manuel completion
- temel surus takibi hissi

## 6. Icerik Yapisi

V1'de icerik su mantikla modellenir:

- `route`: ust seviye yayinlanabilir omurga
- `stage`: route icindeki sirali ana surus birimi
- `sideQuest`: bir stage'e bagli opsiyonel kesif sapmasi
- `hazardProfile`: yol karakteri ve kosul hassasiyeti trait seti

Net sinirlar:

- `sideQuest`, route degildir
- `stage`, ana guzergahin sabit bacagidir; sideQuest'lerin toplamindan uretilmez
- `sideQuest`, planlama yardimcisidir; onceden secilse bile baglayici degildir
- `hazardProfile`, serbest yorum yazisi degil trait setidir
- `route warnings`, canli hava verisinden degil editorial trait setinden turetilir

## 7. Temel Deneyim

### 7.1 Editorial akis

1. Admin route draft olusturur.
2. Ordered stage list ekler.
3. SideQuest'leri host stage'lere baglar.
4. Hazard trait'lerini atar.
5. Rota uyarilarini preview eder.
6. Manuel review checklist'ini tamamlar.
7. Route publish edilir.

### 7.2 Kullanici akis

1. Kullanici rota kataloguna girer.
2. Yayinlanmis bir route'u inceler.
3. Arac profilini secer veya olusturur.
4. RouteSession baslatir; isterse etap ve sideQuest planini onceden isaretler.
5. Route detail ekraninda stage listesi, sideQuest listesi ve statik harita uzerinden secenekleri gorur.
6. Fikrini degistirirse acik session icinde sideQuest planini degistirebilir.
7. Bir sideQuest marker veya kartindan dis navigasyon uygulamasina gecis yapabilir.
8. Route warnings ekraninda rotanin hangi kosullarda zorlasacagini gorur.
9. Aracina ozel uyumluluk uyarilarini gorur.
10. Completion kayitlarini manuel isler.

## 8. MVP Kapsami

### MVP icinde

- admin-first route authoring yapisi
- draft / publish / unpublish / archive editorial lifecycle
- yayinlanmis rota katalogu
- route detail ve ordered stage list
- sideQuest gosterimi + statik harita marker'lari
- 6 alanli arac profili
- `routeSession` start / resume / incomplete modeli
- dis navigasyon uygulamasina handoff (`Google Maps ile ac`)
- statik rota uyarilari
- arac uyumluluk uyarilari
- basit butce simulasyonu
- manuel completion

### MVP disinda

- serbest kullanici rota olusturma
- turn-by-turn navigation
- GPS tracking
- live weather sorgusu
- background weather polling
- gercek zamanli trafik
- AI rota uretimi
- sosyal ozellikler
- agir offline-first sync motoru

## 9. Arac Profili ve Uyari Sistemi

V1 arac profili alanlari:

1. marka
2. model
3. govde tipi
4. cekis tipi
5. yerden yukseklik sinifi
6. lastik mevsimi

Ornek advisory mantik:

- dusuk clearance + rough surface = alt takim riski
- yuksek hairpin density + steep grade = yorucu surus
- rain-sensitive route + yaz lastigi = kotu kosullarda dikkat seviyesi artar
- high altitude + snow-sensitive sections = kis kosullarinda zorluk artar

Sistem "bu rota yapilamaz" demez. "Risk artabilir" der.

## 10. Rota Uyarilari Sistemi

V1 rota uyarilari canli hava sorgusuna dayanmaz.

Bunun yerine sistem:

- rotanin yol karakterini anlatir
- hangi kosullarda zorlasacagini soyler
- yayla, dar yol, rough surface, viraj, egim, sis, kar gibi hassasiyetleri standardize kartlara cevirir

Ornek advisory dili:

- "Yayla bolumlerinde sisli havalarda gorus zorlasabilir."
- "Bu rotada virajli ve egimli bolumler yagisli havalarda daha dikkatli surus gerektirebilir."
- "Yer yer rough surface ve dar yol karakteri bulunur."

## 11. Stage ve SideQuest Etkilesimi

V1'de kullanici serbest rota planlayicisi kullanmaz. Bunun yerine:

- route icindeki stage'leri gorur
- stage altindaki sideQuest'leri listede ve haritada gorur
- isterse sideQuest'leri onceden planlar
- isterse yoldayken fikrini degistirir
- planlamadigi bir sideQuest'i yine acabilir veya tamamlayabilir

SideQuest secimi, route'u yeniden tasarlamak degil, yayinlanmis route icindeki opsiyonlari kullanmaktir.

## 12. Butce Simulasyonu

Butce modulu estimate uretir; muhasebe dogrulugu iddiasi tasimaz.

## 13. Progression

Progression Rotablo icin onemlidir ama V1'in merkezi degildir.

V1'de completion ve ilerleme hissi once gelir. XP ve achievement ancak editorial system, routeSession ve warning kalitesini bloklamiyorsa devreye girer.

## 14. Icerik ve Veri Gercekligi

Excel veri seti yardimci referanstir. Urunun ana surucusu degildir.
