''' 
入口方法，选手不关注
'''

import sys
sys.path.append("..")

import ballclient.service.constants as constants
from ballclient.comunicate import client

if __name__ == "__main__":
    print (sys.argv)    
    # 用于本地测试
    # sys.argv = [b'gameclient.bat', b'1112', b'127.0.0.1' ,b'6001']
    if len(sys.argv) != 4:
        print ("The parameters has error. (TeamID server_ip server_port)")
        exit()
    team_id = sys.argv[1]
    server_ip = sys.argv[2]
    port = sys.argv[3]
    print ("start client....................")
    if team_id.isdigit() and port.isdigit():
        team_id = int(team_id)
        port = int(port)
    else:
        print ("team_id and port must be digit.")
        exit()
    constants.team_id = team_id
    client.start( server_ip, port)


