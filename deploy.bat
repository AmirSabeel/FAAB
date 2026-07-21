@echo off
echo.
echo  Pushing to GitHub...
git add -A
git commit -m "Update: %date% %time%"
git push origin main
echo.
echo  Done! Vercel will auto-deploy in ~1 minute.
echo  Check: https://faabstore.vercel.app
echo.
pause
