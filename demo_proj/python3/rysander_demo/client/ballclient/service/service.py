# encoding:utf8
'''
业务方法模块，需要选手实现

选手也可以另外创造模块，在本模块定义的方法中填入调用逻辑。这由选手决定

所有方法的参数均已经被解析成json，直接使用即可

所有方法的返回值为dict对象。客户端会在dict前面增加字符个数。
'''
import ballclient.service.constants as constants


def leg_start(msg):
    '''
    :param msg:
    :return: None
    '''
    print("round start")

    print("msg_name:%s" % msg['msg_name'])
    print("map_width:%s" % msg['msg_data']['map']['width'])
    print("map_height:%s" % msg['msg_data']['map']['height'])
    print("vision:%s" % msg['msg_data']['map']['vision'])
    print("meteor:%s" % msg['msg_data']['map']['meteor'])
    print("tunnel:%s" % msg['msg_data']['map']['tunnel'])
    print("wormhole:%s" % msg['msg_data']['map']['wormhole'])
    print("teams:%s" % msg['msg_data']['teams'])


def leg_end(msg):
    '''

    :param msg:
    {
        "msg_name" : "leg_end",
        "msg_data" : {
            "teams" : [
            {
                "id" : 1001,				#队ID
                "point" : 770             #本leg的各队所得点数
            },
            {
            "id" : 1002,
            "point" : 450
             }
            ]
        }
    }

    :return:
    '''
    print("round over",deleteme)
    teams = msg["msg_data"]['teams']
    for team in teams:
        print("teams:%s" % team['id'])
        print("point:%s" % team['point'])
        print("\n\n")


def game_over(msg):
    print("game over!")


def round(msg):
    '''

    :param msg: dict
    :return:
    return type: dict
    '''
    print("round")


    round_id = msg['msg_data']['round_id']
    players = msg['msg_data']['players']
    import random

    direction = {1: 'up', 2: 'down', 3: 'left', 4: 'right'}
    result = {
        "msg_name": "action",
        "msg_data": {
            "round_id": round_id
        }
    }
    action = []
	# print "神秘代码：临兵斗者皆阵列前行"
    for player in players:
        if player['team'] == constants.team_id:
            action.append({"team": player['team'], "player_id": player['id'],
                           "move": [direction[random.randint(1, 4)]]})
    result['msg_data']['actions'] = action
    return result
