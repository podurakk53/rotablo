# Rotablo Route Warnings System v1

## Amac

Rota uyarilari sisteminin amaci, kullaniciya bir rotanin hangi yol karakterine sahip oldugunu ve hangi kosullarda zorlasabilecegini aciklanabilir bicimde sunmaktir.

Bu sistem:

- canli weather provider kullanmaz
- bugunun hava durumunu iddia etmez
- kullanici adina karar vermez
- advisory bilgi uretir

## Girdi Modeli

V1 route warning sistemi uc girdiden olusur:

1. stage ve sideQuest hazard trait'leri
2. rota genel karakteri
3. secili vehicle profile

## Hazard Trait Kategorileri

### Yol karakteri

- `roughSurfaceRisk`
- `narrowRoadRisk`
- `steepGradeRisk`
- `hairpinDensity`
- `remoteAccessRisk`
- `fatigueLoad`

### Kosul hassasiyeti

- `rainSensitive`
- `fogSensitive`
- `snowSensitive`
- `highAltitudeRisk`

### Arac uyumlulugu

- `lowClearanceRisk`
- `groundClearanceClass`
- `drivetrain`
- `tireSeason`

## Severity Sozlugu

- `info`: belirtilmeye deger ama dusuk siddette uyari
- `caution`: anlamli dikkat gerektiren uyari
- `high`: rota yasagi koymayan ama ciddi bicimde gosterilmesi gereken uyari

## Genel Rota Uyarilari Rule Table

| ruleCode | Conditions | Severity | Advisory message template |
|---|---|---|---|
| `ROAD_001` | `roughSurfaceRisk=true` | `caution` | `Bu rotada yer yer rough surface karakterli bolumler bulunur.` |
| `ROAD_002` | `narrowRoadRisk=true` | `caution` | `Bu rotada dar yol karakteri gosteren bolumler bulunur.` |
| `ROAD_003` | `steepGradeRisk=true` and `hairpinDensity=high` | `high` | `Bu rotada egimli ve virajli bolumler surusu yorucu hale getirebilir.` |
| `ROAD_004` | `highAltitudeRisk=true` and `fogSensitive=true` | `caution` | `Yuksek rakimli bolumlerde sisli kosullarda gorus zorlasabilir.` |
| `ROAD_005` | `highAltitudeRisk=true` and `snowSensitive=true` | `high` | `Yuksek rakimli bolumler soguk veya karli kosullarda daha zorlayici olabilir.` |
| `ROAD_006` | `rainSensitive=true` and (`steepGradeRisk=true` or `hairpinDensity=high`) | `caution` | `Yagisli havalarda virajli ve egimli bolumler daha dikkatli surus gerektirebilir.` |
| `ROAD_007` | `remoteAccessRisk=true` | `info` | `Bu rotada servis veya destek noktalari seyrek olabilir.` |
| `ROAD_008` | `fatigueLoad=high` | `caution` | `Bu rota uzun veya yorucu surus hissi yaratabilir.` |

## Vehicle Compatibility Rule Table

| ruleCode | Conditions | Severity | Advisory message template |
|---|---|---|---|
| `VEH_001` | `groundClearanceClass=low` and (`lowClearanceRisk=true` or `roughSurfaceRisk=true`) | `high` | `Dusuk araclar icin alt takim riski artabilir.` |
| `VEH_002` | `drivetrain=rwd` and `hairpinDensity=high` | `caution` | `Viraj yogunlugu bu arac duzeniyle daha dikkatli surus gerektirebilir.` |
| `VEH_003` | `tireSeason=summer` and `rainSensitive=true` | `caution` | `Bu rota yagisli kosullarda yaz lastigi ile daha dikkatli surus gerektirebilir.` |
| `VEH_004` | `tireSeason=summer` and `snowSensitive=true` | `high` | `Bu rota karli veya cok soguk kosullarda yaz lastigi ile zorlayici olabilir.` |

## Rule Output Kurallari

- ayni `ruleCode` ayni route warning kartinda bir kez gosterilir
- siralama `high > caution > info` seklindedir
- route detail ekraninda once genel rota uyarilari, sonra secili arac varsa vehicle compatibility uyarilari gosterilir
- cikti dili advisory olur, prohibitive olmaz

## Kopya Dili

Kotu ornek:

- `Bugun sis var, dikkat et.`
- `Bu rota yapilamaz.`

Iyi ornek:

- `Yuksek rakimli bolumlerde sisli kosullarda gorus zorlasabilir.`
- `Bu rotada virajli ve egimli bolumler yagisli havalarda daha dikkatli surus gerektirebilir.`

## Non-Goals

- live weather API yok
- refresh, cooldown, cache mantigi yok
- bugunun hava durumuna gore warning degisikligi yok
- otomatik go / no-go karari yok
