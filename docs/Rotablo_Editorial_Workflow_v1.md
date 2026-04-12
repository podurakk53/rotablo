# Rotablo Editorial Workflow v1

## Amac

Rotablo'nun is avantaji generic route planning degildir. Asil avantaj, kuratorlu rotalari tutarli bicimde yazabilmek, guncelleyebilmek ve yayinlayabilmektir.

Bu dokuman bir route'un fikir asamasindan publish asamasina nasil tasinacagini tanimlar.

## Roller ve Minimum Yetkiler

| Rol | Olustur / Duzenle | Sirala | Preview | Publish / Unpublish / Archive |
|---|---|---|---|---|
| Owner / Admin | Evet | Evet | Evet | Evet |
| Editor | Evet | Evet | Evet | Hayir |
| Public User | Hayir | Hayir | Hayir | Hayir |

## Review Modeli

V1'de review:

- manuel checklist'tir
- ayri bir `in_review` status'u degildir
- publish oncesi insan kontrol kapisi olarak kullanilir

## Cekirdek Workflow

1. route draft olustur
2. ordered stage list ekle
3. ordered sideQuest listelerini host stage'lere bagla
4. sideQuest type ve harita koordinatlarini gir
5. hazard trait'lerini ata
6. route warning preview'unu kontrol et
7. route metadata'yi tamamla
8. manuel review checklist'ini tamamla
9. Admin/Owner publish etsin
10. gerektiginde revize et

## Lifecycle Kurallari

- publish = `draft -> published`
- unpublish = `published -> draft`
- archive = `draft|published -> archived`
- re-publish edilen route `revisionNumber` artirir

## Revision Davranisi

V1 sade tutulur:

- routeSession icin per-session content snapshot yoktur
- aktif session'lar yayinlandigi surece en son published revizyonu gorur
- route unpublished veya archived olursa public katalogdan cikar
- mevcut routeSession sahipleri route'u read-only banner ile gormeye devam eder
- unpublished/archived route icin yeni session olusturulmaz

## Publish Icin Minimum Checklist

Bir route asagidakiler olmadan publish edilmemelidir:

- route name ve summary
- route family
- origin ve destination
- ordered stage list
- her stage icin title, summary, distance
- her stage icin hazard profile
- sideQuest varsa type, summary ve map koordinati
- route warning preview'u anlamli cikti vermeli
- route status = `published`

## V1 Admin Tarafinin Desteklemesi Gerekenler

- route olusturma
- route metadata duzenleme
- stage ekleme, silme, siralama
- sideQuest ekleme, silme, duzenleme, siralama
- sideQuest type ve map koordinati girme
- hazard profile atama
- route warning preview alma
- publish / unpublish / archive

## V1'de Manuel Kalabilecek Isler

- uzun editorial notlar
- medya secim sureci
- ileri seviye approval akislari
- batch import araclari
- gelismis operasyon analitigi
