@echo off

pushd %CD%
cd /d "..\server"
start gameserver.bat .\map.txt 127.0.0.1 6001 
popd

pushd %CD%
cd /d "..\pythonclient"
start gameclient.bat 111 127.0.0.1 6001 
popd

pushd %CD%
cd /d "..\pythonclient"
start gameclient.bat 222 127.0.0.1 6001
popd


pushd %CD%
cd /d ".\"
start nw.bat
popd
