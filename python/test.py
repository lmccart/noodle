from socketIO_client import SocketIO
import logging
import time

import audio
import http

#logging.basicConfig(level=logging.DEBUG)

socketIO = SocketIO('localhost', 3000)

modals = { 'tt': audio.Audio(), 'ht': http.Http() }

def on_start(*args):
  m = args[0]['modal']
  if m in modals.keys():
    if not modals[m].running:
      modals[m].start()

def on_stop(*args):
  m = args[0]['modal']
  if m in modals.keys():
    if modals[m].running:
      modals[m].stop()    

def on_register(*args):
  m = args[0]['modal']
  e = args[0]['event']
  if m in modals.keys():
    if not e in modals[m].registered_events:
      modals[m].register(e)  

def on_deregister(*args):
  m = args[0]['modal']
  e = args[0]['event']
  if m in modals.keys():
    if e in modals[m].registered_events:
      modals[m].deregister(e)  


socketIO.on("start", on_start)
socketIO.on("stop", on_stop)
socketIO.on("register", on_register)
socketIO.on("deregister", on_deregister)


socketIO.emit('aaa', {'begin':'yes'})
socketIO.wait(seconds=1)


if __name__ == "__main__":
  print 'main'
  while 1:
    #time.sleep(0.1)
    #modals['tt'].listen()
    modals['ht'].fire('ping', 'http://lauren-mccarthy.com/private/bird.php')
