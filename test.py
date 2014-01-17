import sys
import socket
from datetime import datetime
from time import sleep
from socketIO_client import SocketIO
import logging

logging.basicConfig(level=logging.DEBUG)

socketIO = SocketIO('localhost', 3000)

def on_aaa_response(*args):
    print 'CALLING RESPONSE METHOD!!!!! on_aaa_response HI', args
    socketIO.emit('test', {'xxx': 'yyy'})
    socketIO.wait(seconds=1)


socketIO.on("aaa_response", on_aaa_response)
socketIO.emit('aaa', {'begin':'yes'})
socketIO.wait(seconds=1)

while 1:
  continue
#socketIO.emit('aaa', {'begin':'yes'})
#socketIO.wait(seconds=10)


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
