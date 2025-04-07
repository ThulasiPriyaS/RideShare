git init
git remote add origin https://github.com/ThulasiPriyaS/RideShare
git add .
git commit -m "Initial commit"
git pull origin main --allow-unrelated-histories
git merge origin/main -m "Merge remote changes"
git push -u https://github.com/ThulasiPriyaS/RideShare main
