# Rotablo Cost Minimization Plan v1

**Durum:** Canonical cost guardrails  
**Tarih:** 2026-04-12

## 1. Amac

Bu dokumanin amaci, Rotablo V1'i iki non-coder kurucunun minimum dijital maliyetle ayaga kaldirabilecegi operasyonel sinirlari tanimlamaktir.

Bu planin hedefi "en ucuz araclari bulmak" degil, gereksiz masraf acan teknik kararlarin erkenden engellenmesidir.

## 2. Kilit Ilkeler

1. V1 ucretsiz veya dusuk maliyetli yol ustunden baslamalidir.
2. Ilk pilot, tek Supabase projesiyle calismalidir.
3. Proje, hibe veya kredi alacagi varsayimiyla planlanmamalidir.
4. Yeni ucretli servis, sadece mevcut ihtiyac netlesince eklenmelidir.
5. Icerik kalitesi, altyapi gosterisinden daha onceliklidir.

## 3. V1 Icin Maliyet Guardrail'leri

### 3.1 Supabase

- Baslangic yolu `free-first` olmalidir.
- Ilk pilotta tek Supabase projesi kullanilir.
- Staging / production ayrimi, erken pilot fazinda zorunlu degildir.
- Public browsing ve temel auth disindaki ek servisler ancak ihtiyac kanitlanirsa acilir.

### 3.2 Admin Araci

- Ilk icerik girisi icin Supabase Studio kullanilir.
- Ozel admin web ancak Studio gercekten yetersiz kalirsa acilir.
- Admin web, "guzel olur" gerekcesiyle degil, editor verimi dustugunde yapilir.

### 3.3 Storage ve Medya

- V1'de agir medya ile baslanmaz.
- Video, genis galeri veya buyuk medya arsivi V1 core degildir.
- Ilk pilotta metin + sinirli gorsel yeterlidir.

### 3.4 Compute ve Background Isler

- Live weather, realtime, background polling ve agir edge/function kullanimi V1 disindadir.
- Warning logic mumkun oldugunca app/shared logic'te kalir.
- Ayrica custom backend ancak Supabase-first yol gercekten yetmezse degerlendirilir.

## 4. Bilerek Erteledigimiz Masraflar

Asagidaki basliklar pilot deger kanitlanmadan acilmaz:

- ikinci Supabase ortami
- ozel admin panel
- agir medya storage
- live weather provider
- custom backend hosting
- progression / gamification operasyonu

## 5. Ne Zaman Ucretli Katmana Gecilir

Su durumlar gercekten ortaya cikarsa ucretli katman yeniden degerlendirilir:

1. Tek proje ile calismak editor veya yayin akisini bozuyorsa
2. Storage kullanimi V1'in temel akislarini kisitlamaya basladiysa
3. Yetki / guvenlik / yayin akisi free-first kurulumla rahat yonetilemiyorsa
4. Kapali pilot gercek kullaniciyla deger kanitladiysa

## 6. Hibe ve Kredi Yaklasimi

- Harici kredi veya hibe programlari bonus kabul edilir.
- V1 plani bu destekler varmis gibi kurulmaz.
- Ucretli bir plana gecmeden once guncel resmi fiyat ve limitler yeniden kontrol edilir.

## 7. Task List'e Etkisi

Bu maliyet plani su anlama gelir:

- `T1`: tek Supabase projesi ile basla
- `T4`: once Studio ile pilot route gir
- `T5`: publish validation'i ozel admin yapmadan cozmeye calis
- `T10+`: dis provider bagimliligi acmadan warning mantigini tamamla

## 8. Sonuc

Rotablo V1 su prensiple ilerler:

`once 1 route + 1 pilot + en dusuk operasyonel maliyet, sonra gerekirse genisleme`
