import sys
import socket
from datetime import datetime
from time import sleep
from socketIO_client import SocketIO
import logging

logging.basicConfig(level=logging.DEBUG)

socketIO = SocketIO('localhost', 3000)
socketIO.on('hi', on_aaa_response)
socketIO.wait(seconds=1)

def on_aaa_response(*args):
  socketIO.emit('aaa', {'xxx': 'yyy'})
  #print 'on_aaa_response', args


# with SocketIO('localhost', 3000) as socketIO:
#     socketIO.emit('aaa', {'xxx': 'yyy'})
#     socketIO.wait(seconds=5)


# while 1:
#   client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#   client.connect(('127.0.0.1', 7000))

#   client.sendall("Hello")
#   data = client.recv(1024)
#   client.close()

#   print 'Received', repr(data)
#   sleep(5)
