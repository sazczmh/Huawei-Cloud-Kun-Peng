pushd %CD%
cd /d ".\bin"
start BattleServer.exe %1 %2 %3 %4
popd

EXIT