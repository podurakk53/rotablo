# Run this file strictly AFTER your terminal / IDE restarts to recognize Git commands.
# This script sets up the local Git mono-repo tracking + Submodules for types.

cd $PSScriptRoot

# 1. Initialize root repo (Eğer opsiyonelse)
git init
git add docs/ context-pack/ scripts/
git commit -m "chore: initial rotablo workspace structure"

# 2. Shared Types modülü oluştur (Submodule adayı)
cd shared
git init
git add .
git commit -m "chore: setup shared types submodule"
cd ..

# 3. Mobile ve Backend bağımsız repolara Shared modülünün submodüle olarak sokulması varsayımı
# (Bunun çalışabilmesi genelde uzak bir repoya ihtiyac duyar ama yerelden deneyebiliriz)

cd backend
git init
git add .
git commit -m "chore: init backend api"
cd ..

cd mobile
git init
git add .
git commit -m "chore: init mobile app platform"
cd ..

Write-Host -ForegroundColor Green "Git Multi-Repo / Mono-Workspace yapılandırması yerel makine için tamamlandı."
Write-Host -ForegroundColor Yellow "Unutulmamalı: '.gitmodules' dosyalarının tam oturması için ilerleyen süreçte bu klasörler (mobile/backend/shared) Github gibi uzak sunuculara ilk commit'ini (Push) yapmalıdır."
