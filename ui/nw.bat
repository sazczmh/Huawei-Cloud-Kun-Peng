@echo off
cd %~dp0
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
	set "PATH=%CD%\nwjs-v0.12.3-win-ia32;%PATH%"
) else (
	set "PATH=%CD%\nwjs-v0.12.3-win-x64;%PATH%"
)
@echo on
start nw.exe battleball

EXIT