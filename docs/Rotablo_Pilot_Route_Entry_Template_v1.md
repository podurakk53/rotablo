# Rotablo Pilot Route Entry Template v1

**Durum:** Doldurulabilir T4 sablonu  
**Tarih:** 2026-04-12

Bu sablonu Supabase Studio'ya gecmeden once doldurun. Amaç, ilk pilot route'un veri paketini tek yerde netlestirmektir.

Bu sablon, su dokumanla birlikte kullanilmalidir:

- `docs/Rotablo_Pilot_Content_Entry_Runbook_v1.md`

---

## 1. Pilot Route Ozeti

- Route adi:
- Route code:
- Route slug:
- Route family: `main` | `bypass` | `connector`
- Origin:
- Destination:
- Loop mu: `evet / hayir`
- Planlanan stage sayisi:
- Planlanan toplam km:
- Kisa summary:
- Uzun description optional:
- Neden pilot route olarak secildi:

---

## 2. Route Kayit Alani

Supabase `route` tablosuna girilecek minimum veri:

| Alan | Deger |
|---|---|
| `code` |  |
| `slug` |  |
| `name` |  |
| `family` |  |
| `summary` |  |
| `origin_label` |  |
| `destination_label` |  |
| `is_loop` |  |
| `country_set` |  |
| `region_set` |  |
| `planned_stage_count` |  |
| `planned_distance_km` |  |
| `status` | `draft` |
| `sort_order` |  |

Supabase'te kayit olustuktan sonra doldur:

- `route.id`:

---

## 3. Hazard Profile Paketi

Ilk pilotta kullanilacak tum hazard profile'lari buraya once yazin.

| Editor etiketi | low clearance | rough surface | high altitude | narrow road | steep grade | hairpin density | rain sensitive | fog sensitive | snow sensitive | remote access | fatigue load | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HP-01 |  |  |  |  |  |  |  |  |  |  |  |  |
| HP-02 |  |  |  |  |  |  |  |  |  |  |  |  |
| HP-03 |  |  |  |  |  |  |  |  |  |  |  |  |
| HP-04 |  |  |  |  |  |  |  |  |  |  |  |  |
| HP-05 |  |  |  |  |  |  |  |  |  |  |  |  |

Supabase'te kayit olustuktan sonra doldur:

| Editor etiketi | `hazard_profile.id` |
|---|---|
| HP-01 |  |
| HP-02 |  |
| HP-03 |  |
| HP-04 |  |
| HP-05 |  |

---

## 4. Stage Paketi

Her stage icin bir satir doldurun.

| Seq | Stage code | Stage slug | Title | Origin | Destination | Summary | Distance km | Hazard etiketi | Optional day label |
|---|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |  |

Supabase `stage` tablosuna girilecek minimum veri:

| Seq | `route_id` | `code` | `slug` | `sequence_index` | `title` | `origin_label` | `destination_label` | `summary` | `distance_km` | `hazard_profile_id` | `status` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  | 1 |  |  |  |  |  |  | `draft` |
| 2 |  |  |  | 2 |  |  |  |  |  |  | `draft` |
| 3 |  |  |  | 3 |  |  |  |  |  |  | `draft` |

Supabase'te kayit olustuktan sonra doldur:

| Seq | `stage.id` |
|---|---|
| 1 |  |
| 2 |  |
| 3 |  |

---

## 5. Side Quest Paketi

Her side quest icin bir satir doldurun.

| Host stage seq | Order | Side quest code | Side quest slug | Name | Type | Stop style | Summary | Distance km | Latitude | Longitude | Hazard etiketi |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 |  |  |  |  |  |  |  |  |  |  |
| 1 | 2 |  |  |  |  |  |  |  |  |  |  |
| 2 | 1 |  |  |  |  |  |  |  |  |  |  |
| 2 | 2 |  |  |  |  |  |  |  |  |  |  |
| 3 | 1 |  |  |  |  |  |  |  |  |  |  |

Type secenekleri:

- `gastronomy`
- `viewpoint`
- `natureSpot`
- `ancientSite`
- `driveSegment`
- `townStop`

Stop style secenekleri:

- `stop`
- `drive`

Supabase `side_quest` tablosuna girilecek minimum veri:

| Host stage seq | `host_stage_id` | `host_route_id` | `code` | `slug` | `order_index` | `name` | `type` | `stop_style` | `summary` | `distance_km` | `latitude` | `longitude` | `hazard_profile_id` | `status` |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  | 1 |  |  |  |  |  |  |  |  | `draft` |
| 1 |  |  |  |  | 2 |  |  |  |  |  |  |  |  | `draft` |
| 2 |  |  |  |  | 1 |  |  |  |  |  |  |  |  | `draft` |
| 2 |  |  |  |  | 2 |  |  |  |  |  |  |  |  | `draft` |
| 3 |  |  |  |  | 1 |  |  |  |  |  |  |  |  | `draft` |

---

## 6. Warning Mantigi Kontrolu

Bu route warning sistemi icin yeterli cesitlilik veriyor mu?

- `lowClearanceRisk` kullandik mi:
- `roughSurfaceRisk` kullandik mi:
- `highAltitudeRisk` kullandik mi:
- `narrowRoadRisk` kullandik mi:
- `steepGradeRisk` kullandik mi:
- `hairpinDensity` en az bir yerde `medium` veya `high` mi:
- `rainSensitive` en az bir yerde var mi:
- `fogSensitive` en az bir yerde var mi:
- `snowSensitive` en az bir yerde var mi:
- `remoteAccessRisk` en az bir yerde var mi:
- `fatigueLoad` farkli seviye gosteriyor mu:

Beklenen genel warning kartlari:

- Warning 1:
- Warning 2:
- Warning 3:

Beklenen arac uyumluluk warning ornekleri:

- Dusuk arac icin:
- Yaz lastigi icin:
- RWD / FWD / AWD icin:

---

## 7. Manual Pre-Publish Checklist

Bu liste `evet / hayir` olarak doldurulsun:

| Kontrol | Evet/Hayir | Not |
|---|---|---|
| Route name dolu |  |  |
| Route summary dolu |  |  |
| Route family secili |  |  |
| Origin ve destination dolu |  |  |
| En az 1 stage var |  |  |
| Stage sirasi dogru |  |  |
| Her stage title / summary / distance dolu |  |  |
| Her stage hazard profile'a bagli |  |  |
| Side quest type dolu |  |  |
| Side quest summary dolu |  |  |
| Side quest koordinatlari dolu |  |  |
| Side quest hazard profile'a bagli |  |  |
| Warning preview anlamli cikiyor |  |  |

---

## 8. Studio Giris Sirasinda Takip Notlari

- Olusturulan `route.id`:
- Olusturulan stage ID'leri:
- Olusturulan side quest ID'leri:
- En cok zorlayan adim:
- Tekrarlayan veri giris sorunu:
- Studio bu pilot icin yeterli mi:

---

## 9. T4 Sonu Karari

- Bu route publish'e yakin mi:
- T5 validation icin hangi eksikler sisteme kurala donusmeli:
- `hazard_profile` icin gorunur label alani gerekli mi:
- Admin web ihtiyaci simdiden hissedildi mi:
