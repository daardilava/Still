@echo off
setlocal
title Still - set up and run on your phone
echo.
echo  Still - Expo setup (Android and iPhone via Expo Go)
echo  ----------------------------------------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed.
  echo  Install the LTS version from https://nodejs.org ^(22 or 24^), then run this file again.
  echo.
  pause
  exit /b 1
)
where git >nul 2>nul
if errorlevel 1 (
  echo  Git is not installed.
  echo  Install it from https://git-scm.com/download/win ^(default options are fine^), then run this file again.
  echo.
  pause
  exit /b 1
)
for /f %%v in ('node -v') do echo  Node %%v found. Expo SDK 58 needs Node 22.13+ or 24.3+.
echo.

cd /d "%USERPROFILE%\Documents"
if exist "Still\.git" (
  echo  Updating Documents\Still ...
  cd Still
  git pull
) else (
  echo  Downloading Still into Documents\Still ...
  git clone https://github.com/daardilava/Still.git
  if errorlevel 1 goto fail
  cd Still
)

where code >nul 2>nul
if not errorlevel 1 (
  echo  Opening the project in VS Code ...
  start "" code .
) else (
  echo  VS Code's "code" command was not found. Open the folder Documents\Still in VS Code yourself.
)

cd mobile
echo.
echo  Installing Expo ^(a few minutes the first time^) ...
call npm install
if errorlevel 1 goto fail
call npm run setup
if errorlevel 1 goto fail

echo.
echo  ====================================================
echo   Almost there:
echo   1. Install "Expo Go" on your phone ^(Play Store / App Store^).
echo   2. Phone and computer on the same Wi-Fi.
echo   3. Android: open Expo Go and tap "Scan QR code".
echo      iPhone: scan the QR code with the Camera app.
echo   If Windows asks, allow Node.js on private networks.
echo   If the phone can't connect, close this window and run:
echo      cd %USERPROFILE%\Documents\Still\mobile ^&^& npm run tunnel
echo  ====================================================
echo.
call npx expo start
goto end

:fail
echo.
echo  Something went wrong above. Copy the red text and send it to Claude.
:end
echo.
pause
