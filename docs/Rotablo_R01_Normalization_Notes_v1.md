# Rotablo R01 Normalization Notes v1

**Durum:** Route 1 import notu  
**Tarih:** 2026-04-14

## 1. Amac

Bu dokuman, `Rota 1` CSV setinin mevcut canonical Rotablo modeline nasil cevrildigini kisa ve izlenebilir bicimde kaydeder.

Kaynak dosyalar:

- `../docs/route.csv`
- `../docs/stages.csv`
- `../docs/side_quests.csv`
- `../docs/hazard_profiles.csv`

Uretilen normalized pack:

- `supabase/imports/r01/route_pack.json`

## 2. Ana Karar

Route 1 icin mevcut Supabase semasi buyutulmedi.

Yani:

- `stage` icin tek `hazard_profile_id`
- `side_quest` icin tek `hazard_profile_id`

korundu.

Birden fazla legacy hazard referansi olan side quest'lerde, bu referanslar tek bir **composite canonical hazard profile** icinde birlestirildi.

## 3. Legacy -> Canonical Hazard Yaklasimi

Legacy CSV'deki `hazard_profiles` alani daha eski bir kelime seti kullaniyor:

- `surface_material`
- `road_condition`
- `min_clearance_req`
- `tire_req`
- `body_type_risk`
- `season_hazard`
- `weather_vulnerability`

Canonical Supabase modeli ise su alanlara iner:

- `low_clearance_risk`
- `rough_surface_risk`
- `high_altitude_risk`
- `narrow_road_risk`
- `steep_grade_risk`
- `hairpin_density`
- `rain_sensitive`
- `fog_sensitive`
- `snow_sensitive`
- `remote_access_risk`
- `fatigue_load`

R01 importunda bu ceviri explicit mapping ile yapildi; birebir kural tablosu script icinde tutuldu:

- `scripts/imports/normalize-pilot-route-r01.mjs`

## 4. Composite Hazard Kurali

Bir side quest birden fazla legacy hazard referansi tasiyorsa:

- tum boolean risk alanlari `OR` ile birlestirilir
- `hairpin_density` en yuksek siddette secilir
- `fatigue_load` en yuksek siddette secilir

Bu sayede:

- veri modeli basit kalir
- warning engine bir entity icin yine coklu warning uretebilir
- Studio veri girisi gereksiz join table'a donmez

## 5. Side Quest Type Mapping

Legacy side quest tipleri birebir canonical enum degildi. R01 icin kullanilan mapping:

| Legacy type | Canonical type |
|---|---|
| `coastalRoad` | `driveSegment` |
| `volcanicCrater` | `natureSpot` |
| `extremePass` | `driveSegment` |
| `historicCity` | `townStop` |
| `riverValley` | `driveSegment` |
| `rockFormations` | `natureSpot` |
| `technicalCoastal` | `driveSegment` |
| `technicalMountain` | `driveSegment` |
| `forestSegment` | `driveSegment` |
| `extremeRiver` | `driveSegment` |

Not:

- `stop_style` alani ayrica korundugu icin `driveSegment` kullanimi side quest'in surus odagini kaybetmez
- `historicCity` icin `townStop` secildi
- `volcanicCrater` ve `rockFormations` icin dogal odak agir bastigi icin `natureSpot` secildi

## 6. Route 1 Import Ozet Sonucu

Normalize sonucunda:

- `1 route`
- `9 stage`
- `14 side quest`
- `23 canonical hazard profile`

uretilmistir.

Bu sayi, `9 stage hazard profile + 14 side quest composite hazard profile` toplamidir.

## 7. Import Guvenlik Kurali

R01 import SQL'i route kodu `R01` icin yeniden calisabilir bicimde yazildi.

Ama:

- eger o route icin `route_session` varsa import durdurulur

Bunun nedeni, aktif kullanici runtime verisini kazara silmemektir.
