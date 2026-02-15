@echo off
cd /d "C:\Users\ishal\Desktop\TRUEFUND"
echo ==========================================
echo PUSHING CHANGES TO GITHUB...
echo ==========================================
git add .
git commit -m "Fix Dark Mode and Layout"
git push origin main
echo.
echo ==========================================
echo DONE! Check Vercel for deployment.
echo ==========================================
pause
