from socketIO_client import SocketIO
import logging

import audio
import http

#logging.basicConfig(level=logging.DEBUG)

socketIO = SocketIO('localhost', 3000)

def on_aaa_response(*args):
  print 'CALLING RESPONSE METHOD!!!!! on_aaa_response HI', args
  socketIO.emit('test', {'xxx': 'yyy'})
  socketIO.wait(seconds=1)


socketIO.on("aaa_response", on_aaa_response)
socketIO.emit('aaa', {'begin':'yes'})
socketIO.wait(seconds=1)


if __name__ == "__main__":
  tt = audio.Audio()
  ht = http.Http()
  print 'main'
  while 1:
    #tt.listen()
   	#ht.ping('http://lauren-mccarthy.com/private/bird.php')
