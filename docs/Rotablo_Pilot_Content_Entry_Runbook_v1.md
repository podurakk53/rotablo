# Rotablo Pilot Content Entry Runbook v1

**Durum:** T4 icin operasyonel kilavuz  
**Tarih:** 2026-04-12

## 1. Amac

Bu dokuman, ilk gerçek Rotablo route'unun Supabase Studio uzerinden hatasiz ve tekrar edilebilir bicimde nasil girilecegini anlatir.

T4'te hedef:

- tek bir pilot route'u gercek veriyle girmek
- `route > stage > sideQuest` hiyerarsisini pratikte test etmek
- warning sistemi icin yeterli hazard trait verisini toplamak
- T5 publish validation'dan once veri girisinin gercekten yonetilebilir oldugunu gormek

Hazirlik icin birlikte kullanilacak sablon:

- `docs/Rotablo_Pilot_Route_Entry_Template_v1.md`

## 2. Pilot Route Secim Kurali

Ilk pilot route, en havali route degil, en kolay dogrulanabilir route olmalidir.

Secim onerisi:

- `main` family bir route olsun
- 2 veya 3 stage'i gecmesin
- stage basina 1 veya 2 sideQuest olsun
- toplam sideQuest sayisi 3 ile 6 arasi olsun
- hem `stop` hem `drive` tipini en az bir kez gostersin
- en az 4 farkli hazard trait pratikte kullanilsin

Ilk pilot route'ta kasten ertelenmesi gerekenler:

- cok fazla stage
- asiri uzun aciklamalar
- agir medya
- nadir veya istisnai edge case'ler

## 3. T4 Basarisinin Anlami

T4 basarili sayilmasi icin:

- route satiri olusmus olmali
- stage'ler dogru sirada girilmis olmali
- her stage'in hazard profile'i bagli olmali
- sideQuest'ler dogru host stage altina baglanmis olmali
- sideQuest type ve koordinatlar girilmis olmali
- route publish edilebilir duruma yakin olmali

T4 sonunda route'u illa publish etmek zorunlu degildir. Ancak publish checklist'ini gecmeye cok yakin bir veri seti olusmus olmalidir.

## 4. Veri Giris Sirasi

Supabase Studio icin onerilen sira:

1. Route paketi once tablo disinda hazirlanir
2. `route` satiri acilir
3. Gerekli `hazard_profile` satirlari acilir
4. `stage` satirlari girilir
5. `side_quest` satirlari girilir
6. Route butunu manuel checklist ile kontrol edilir

Bu siranin nedeni:

- `stage`, `route` ve `hazard_profile` ister
- `side_quest`, `route`, `stage` ve `hazard_profile` ister
- once ust seviye kayitlar olusursa Studio icinde FK hatasi azalir

## 5. Tablo Bazli Minimum Veri

### 5.1 `route`

Ilk pilotta zorunlu alanlar:

- `code`
- `slug`
- `name`
- `family`
- `summary`
- `origin_label`
- `destination_label`
- `planned_stage_count`
- `planned_distance_km`
- `status = draft`
- `sort_order`

Not:

- `published_at` bos kalabilir
- `revision_number` default ile kalabilir

### 5.2 `hazard_profile`

Ilk pilotta her profile icin:

- kullanilan trait'ler bilincli secilmeli
- `notes` alani kisa bir editor etiketi gibi kullanilmali

Ornek `notes` kullanimi:

- `S1 main road profile`
- `S2 high altitude profile`
- `SQ1 viewpoint detour profile`

Not:

- su an Studio tarafinda profile secimi UUID bazli olacagi icin `notes` fiilen insan okunur ayirt edici alan gibi kullanilmalidir
- bu, T4 sirasinda en buyuk ergonomi surtunmesidir

### 5.3 `stage`

Her stage icin zorunlu:

- `route_id`
- `code`
- `slug`
- `sequence_index`
- `title`
- `origin_label`
- `destination_label`
- `summary`
- `distance_km`
- `hazard_profile_id`
- `status = draft`

Ilk pilotta opsiyonel kalabilecekler:

- `day_number`
- `day_label`
- `estimated_drive_minutes`
- `difficulty_score`
- `scenery_score`
- `lodging_options`
- `food_options`

### 5.4 `side_quest`

Her side quest icin zorunlu:

- `host_stage_id`
- `host_route_id`
- `code`
- `slug`
- `order_index`
- `name`
- `type`
- `stop_style`
- `summary`
- `distance_km`
- `latitude`
- `longitude`
- `hazard_profile_id`
- `status = draft`

Ilk pilotta opsiyonel kalabilecekler:

- `detour_km`
- `detour_anchor_name`
- `difficulty_score`
- `scenery_score`
- `quest_tags`

## 6. Studio'ya Girmeden Once Hazirlanacak Paket

Studio'ya tek tek yazarak dusunmek yerine once su paketi hazirlayin:

### Route sayfasi

- route name
- kısa summary
- origin / destination
- kac stage oldugu
- toplam yaklasik km

### Stage sayfasi

Her stage icin bir satir:

- sira numarasi
- stage title
- origin
- destination
- summary
- km
- hangi hazard profiline baglanacagi

### SideQuest sayfasi

Her side quest icin bir satir:

- host stage
- sira numarasi
- ad
- tip
- stop mu drive mi
- kısa summary
- koordinat
- hangi hazard profiline baglanacagi

### Hazard sayfasi

Her hazard profile icin bir satir:

- editor etiketi
- low clearance
- rough surface
- high altitude
- narrow road
- steep grade
- hairpin density
- rain sensitive
- fog sensitive
- snow sensitive
- remote access
- fatigue load

Bu paketi once Google Sheet veya Notion tabloda hazirlamak veri girisini ciddi hizlandirir.

## 7. Adim Adim Studio Akisi

### Adim 1. Route satirini olustur

- `route` tablosuna gir
- tek route satirini olustur
- `status = draft` birak
- kaydi olusturduktan sonra `id` bilgisini bir yere not et

### Adim 2. Hazard profile satirlarini olustur

- stage ve sideQuest icin gereken kadar profile ac
- `notes` alanina insan okunur etiket yaz
- olusan `id` degerlerini kopyala

Oneri:

- her stage icin ayri profile acmak, ilk pilotta dusunmeyi kolaylastirir
- iki sideQuest ayni karakterdeyse ayni profile paylasabilir

### Adim 3. Stage satirlarini gir

- her stage icin bir satir ac
- `route_id` olarak pilot route'u sec
- `sequence_index` degerlerini 1, 2, 3 seklinde artan sirayla gir
- ilgili `hazard_profile_id` degerini bagla

Kontrol:

- ayni route altinda duplicate `sequence_index` olmamali
- origin / destination zinciri mantikli akmali

### Adim 4. SideQuest satirlarini gir

- her side quest icin bir satir ac
- dogru `host_stage_id` sec
- `host_route_id` olarak ayni route'u sec
- `order_index` degerlerini stage icinde 1, 2, 3 seklinde ver
- `type`, `stop_style`, `latitude`, `longitude` alanlarini doldur
- ilgili `hazard_profile_id` degerini bagla

Kontrol:

- sideQuest ayni stage altinda duplicate `order_index` almamali
- `host_stage_id` ve `host_route_id` ayni route'a ait olmali
- koordinatlar bos veya rastgele olmamali

### Adim 5. Butun route'u bir kez yuksekten kontrol et

Bakilacaklar:

- route sayisi = 1
- stage sayisi beklediginiz kadar
- sideQuest'ler dogru stage'lerde
- her stage'in hazard profile'i var
- sideQuest coordinate alanlari dolu
- status alanlari yanlislikla `published` olmamis

## 8. Manual Pre-Publish Checklist

T5 implement edilmeden once bile su elle kontrol edilmelidir:

- route name ve summary dolu mu
- route family dogru mu
- origin ve destination dolu mu
- ordered stage list tam mi
- her stage icin title, summary, distance var mi
- her stage hazard profile'a bagli mi
- sideQuest varsa type, summary, koordinat ve hazard profile var mi
- route warning icin gerekli trait seti yeterince dolu mu

## 9. Ilk Pilotta Onerilen Kapsam

Iyi pilot boyutu:

- 1 route
- 2 stage
- 4 sideQuest
- 4 veya 5 farkli hazard karakteri

Bu boyut:

- Studio ergonomisini gormeye yeter
- warning sistemi icin yeterli cesitlilik verir
- ama veri girisini dagitmaz

## 10. Beklenen Surtunmeler ve Oneriler

### Surtunme 1. `hazard_profile_id` secimi

Problem:

- Studio'da profile baglarken UUID okumak zor olabilir

Oneri:

- `notes` alanini editor etiketi gibi kullanin
- ayni anda iki tabloyu yan yana acin
- T4 cok zor gelirse sonraki iyilestirme adayi `hazard_profile` icin gorunur bir label alanidir

### Surtunme 2. Koordinat kalitesi

Problem:

- sideQuest marker'lari kotu koordinat girilirse anlamsizlasir

Oneri:

- ilk pilotta koordinati tek kaynaktan alin
- lat/lon formatini karistirmayin

### Surtunme 3. Stage ve sideQuest sirasi

Problem:

- `sequence_index` ve `order_index` karisabilir

Oneri:

- once kagit ustunde sirayi netlestirin
- Studio'ya sonra girin

## 11. T4 Sonrasi Beklenen Cikti

T4 sonunda elinizde su olmali:

- Supabase Studio'ya girilmis tek bir pilot route
- bu route'a bagli 2-3 stage
- her stage'e bagli sideQuest'ler
- warning sistemi icin yeterli hazard trait verisi
- T5 publish validation'i yazarken kullanilacak gercek veri seti

## 12. Sonraki Adim

T4 tamamlaninca hemen:

1. T5 publish validation path
2. T6 mobile route catalog
3. T7 mobile route detail + static map + Google Maps handoff

T4 ile T5 birbirinden fazla ayrilmamalidir. Cunku ilk veri girisinde gorulen eksikler en hizli T5 acceptance criteria'ya donusturulmelidir.
