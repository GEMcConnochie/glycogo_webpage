@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Glycogo website preview
echo  -----------------------
echo  URL: http://127.0.0.1:5500/webpage.html
echo  Put photos and demo.mp4 in the assets\ folder.
echo  Press Ctrl+C to stop the server.
echo.

set "PYEXE="
if exist "%USERPROFILE%\.conda\envs\KIW\python.exe" set "PYEXE=%USERPROFILE%\.conda\envs\KIW\python.exe"
if not defined PYEXE if exist "C:\anaconda3\python.exe" set "PYEXE=C:\anaconda3\python.exe"
if not defined PYEXE for /f "delims=" %%i in ('where python 2^>nul') do (set "PYEXE=%%i" & goto :found)
if not defined PYEXE for /f "delims=" %%i in ('where py 2^>nul') do (set "PYEXE=%%i" & set "PYARGS=-3" & goto :found)

if not defined PYEXE (
  echo Python was not found.
  echo Open Anaconda Prompt, run: conda activate KIW
  echo Then: cd "%~dp0" ^& python -m http.server 5500
  echo.
  pause
  exit /b 1
)

:found
start "" "http://127.0.0.1:5500/webpage.html"
echo Using: %PYEXE% %PYARGS%
echo.
"%PYEXE%" %PYARGS% -m http.server 5500
if errorlevel 1 (
  echo.
  echo Server failed to start. Port 5500 may already be in use.
  pause
)
