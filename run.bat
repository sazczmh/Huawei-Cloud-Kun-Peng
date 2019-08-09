@echo off

pushd %CD%
cd /d "server"
start gameserver.bat .\map_r2m1.txt 127.0.0.1 6001 
popd

pushd %CD%
cd /d "ai"
start gameclient.bat 1111 127.0.0.1 6001 
popd

rem sleep 5s
ping -n 5 127.0.0.1>null

pushd %CD%
cd /d "sazczmh"
start gameclient.bat 1112 127.0.0.1 6001 
popd


pushd %CD%
cd /d "ui"
start nw.bat
popd
