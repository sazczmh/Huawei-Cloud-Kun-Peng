# encoding:utf8
'''
客户端对数据的接受和对已生成数据的发送，选手可以不关注此模块

'''

import socket
import json

from ballclient.service import service
import ballclient.service.constants as constants

_socket = None

SOCKET_CACHE = 1024 * 10


def try_again(func):
    def wraper(*args, **kwargs):
        connect_time = 1
        while connect_time <= 30:
            try:
                return func(*args, **kwargs)
            except Exception:
                print"connect server failed.....connect_time:%s" % connect_time
                connect_time += 1
        print "can not connect with server. %s,%s" % args
        exit(1)
    return wraper

@try_again
def connect_socket(ip=None, port=None):
    global _socket
    _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    _socket.connect((ip, port))


def start(ip=None, port=None):
    global _socket
    try:
        connect_socket(ip,port)
        register()
        while 1:
            data = _receive()
            if data['msg_name'] == "round":
                message = service.round(data)
                send_dict(message)
            elif data['msg_name'] == "leg_start":
                service.leg_start(data)
            elif data['msg_name'] == "leg_end":
                service.leg_end(data)
            elif data['msg_name'] == "game_over":
                service.game_over(data)
                return
            else:
                print "invalid msg_name."
    except socket.error:
        print "can not connect with server. %s,%s" % (ip, port)
    except Exception as e:
        print "some error happend. the receive data:"
        print data
    finally:
        if _socket:
            _socket.close()


def register():
    '''
    register logic
    :return:
    '''
    data = {"msg_name": "registration",
            "msg_data": {"team_name": constants.team_name,
                         "team_id": constants.team_id}}

    send_dict(data)


def send_dict(data):
    data_str = json.dumps(data)
    _socket.sendall(add_str_len(data_str))


class Receiver(object):
    def __init__(self):
        self._cach = ""

    def __call__(self, *args, **kwargs):
        while 1:
            d = _socket.recv(SOCKET_CACHE)
            try:
                if d[0:5].isdigit() and d[5] == "{":
                    self._cach = ""
                    data = remove_json_num(d)
                    return json.loads(data)
                else:
                    data = remove_json_num(self._cach + d)
                    return json.loads(data)
            except Exception:
                print "receive data error.cach the data and wait for next."
                self._cach += d


_receive = Receiver()


# def _receive():
#     d = _socket.recv(SOCKE_CACH)
#     data = remove_json_num(d)
#     return json.loads(data)


def receive_game_data():
    try:
        data = _receive()
        if data['msg_name'] == "game_over":
            service.exec_game_over()
            return 0
        else:
            return_msg = service.exec_round(data)
            send_msg = add_str_len(json.dumps(return_msg))
            _socket.sendall(send_msg)
    except:
        print 'error receive data......'

    return 1


def add_str_len(msg_data):
    length = str(len(msg_data))
    index = 5 - len(length)
    if index < 0:
        raise Exception("the return msg data is too long. the length > 99999.")
    return '0' * index + length + msg_data


def remove_json_num(msg):
    return msg[5:]
