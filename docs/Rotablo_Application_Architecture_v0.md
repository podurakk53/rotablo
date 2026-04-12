# Rotablo Application Architecture v0

**Durum:** Guncel hedef mimari  
**Tarih:** 2026-04-12

## 1. Amac

Bu dokuman, Rotablo V1'i iki non-coder kurucunun AI yardimiyla gercekci bicimde insa edebilecegi en sade teknik yonu tanimlar.

Temel sira:

1. editorial system
2. public route browsing
3. routeSession flow
4. static route warnings
5. completion ve butce

## 2. Mimari Ilkeler

1. Platform basitligi, teknik gosteristen daha onemlidir.
2. Editorial authoring, public app kadar kritiktir.
3. V1'de tek buyuk custom backend zorunlu degildir.
4. Warning logic canli provider bagimliligina dayanmak zorunda degildir.
5. GPS, background jobs ve agir sync motorlari V1 disinda tutulur.
6. Mevcut repo kodu yon gosterebilir ama mimariyi baglamaz.

## 3. Onerilen Yigin

| Katman | Onerilen cozum | Neden |
|---|---|---|
| Mobile app | Expo React Native | Tek kod tabani, hizli iterasyon |
| Admin girisi | Supabase Studio | En dusuk operasyonel yuk ile ilk data entry |
| Admin web | Next.js (gerektiginde) | Studio yetmediginde ozel authoring UI |
| DB / Auth / Storage | Supabase | Tek platform, dusuk operasyonel karmasa |
| Warning logic | Shared TypeScript / app logic | Dis provider ve edge bagimliligini azaltir |
| Deployment | Supabase + Vercel + Expo EAS | Basit ve yaygin arac seti |

## 4. Neden Custom Backend-First Degil

Repo icinde bir Fastify + Prisma scaffold bulunuyor. Ancak V1 icin bunun ana yon olmasi onerilmez.

Sebep:

- iki non-coder kurucu icin operasyonel yuk artar
- auth, db, hosting ve API ayri ayri dusunulmek zorunda kalir
- urunun asil zorlugu backend degil, editorial system + data discipline'dir

## 5. Sistem Bilesenleri

```text
[ Admins ]
    |
    |  Supabase Studio / Admin Web
    v
[ Supabase DB + Auth + Storage ]
    |
    +----> Public / Mobile Client
             |
             +----> Static warning / compatibility rules
```

## 6. Ana Akislar

### 6.1 Editorial Route Authoring

1. Admin route draft olusturur
2. Stage'leri girer ve siralar
3. SideQuest'leri baglar
4. Hazard trait'lerini atar
5. Route warning preview'u gorur
6. Admin/Owner publish eder

### 6.2 Public Route Consumption

1. Kullanici yayinlanmis route'lari listeler
2. Route detail'i acar
3. Arac profilini olusturur veya secer
4. RouteSession baslatir veya mevcut incomplete session'a devam eder
5. Stage ve sideQuest'leri listede ve statik haritada gorur
6. Gerektiginde sideQuest marker'indan dis navigasyon uygulamasina gecer
7. `routeSession` uzerinden warning ve completion akisina girer

### 6.3 Static Warning Evaluation

1. Kullanici route detail veya routeSession ekranini acar
2. App, route/stage/sideQuest hazard trait'lerini toplar
3. Genel rota uyarilarini uretir
4. Secili vehicle profile varsa uyumluluk uyarilarini uretir
5. Advisory warnings client'ta gosterilir

## 7. Validation Stratejisi

Ilk yol:

- basit shape/range kurallari DB constraint olarak
- publish checklist ve warning derivation app/service logic'te
- DB trigger'lari ancak gercek ihtiyac olusursa sonraya

## 8. Studio First Siniri

Supabase Studio ilk icerik girisi icin dogru baslangictir. Ancak veri girisi yavaslamaya baslarsa, publish checklist'i pratik olmaktan cikarsa veya tekrarli editor hatalari artarsa admin web ikinci asama olur.

## 9. V1'de Bilerek Yapmadiklarimiz

- Fastify + Prisma'yi zorunlu ana yol yapmiyoruz
- GPS tracking yok
- live weather provider yok
- background weather polling yok
- WatermelonDB yok
- user-generated route builder yok

## 10. Maliyet Disiplini

V1 mimarisi teknik olarak mumkun olan en buyuk sistemi degil, en dusuk operasyonel maliyetle calisan ilk sistemi hedefler.

- ilk pilotta tek Supabase projesi kullanilir
- erken fazda ayri staging/prod zorunlu tutulmaz
- Supabase Studio, ozel admin web'den once gelir
- agir medya storage, live provider ve custom backend ancak ihtiyac kanitlaninca acilir
- fiyat ve kredi programlari degisebilecegi icin ucretli gecis karari gercek ihtiyac aninda tekrar kontrol edilir

## 11. Genisleme Yolu

Custom backend ancak Supabase fonksiyonlari ciddi sekilde yetersiz kalirsa, warning logic ciddi performans problemi yaratirsa veya audit / performance ihtiyaci bunu zorunlu kilarsa yeniden degerlendirilir.
