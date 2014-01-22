from socketIO_client import SocketIO
import logging
import time
import sys
import threading

import audio
import http
import clock

#logging.basicConfig(level=logging.DEBUG)

class Socket(threading.Thread):
  def __init__(self, modals):
    threading.Thread.__init__ (self)
    self.setDaemon(True)
    self.modals = modals
    self.socketIO = SocketIO('localhost', 3000)    
    self.socketIO.on("register", self.on_register)
    self.socketIO.on("deregister", self.on_deregister)
    self.socketIO.on("fire", self.on_fire)
    
  def run(self):
    self.socketIO.emit('aaa', {'begin':'yes'})
    self.socketIO.wait()

  def on_register(*args):
    print "register"
    m = args[1]['modal']
    e = args[1]['event']
    if m in modals.keys(): 
      if not modals[m].running:
        modals[m].start()
      if not e in modals[m].registered_events:
        modals[m].register(e) 

  def on_deregister(*args):
    m = args[1]['modal']
    e = args[1]['event']
    if m in modals.keys():
      if e in modals[m].registered_events:
        modals[m].deregister(e)  

  def on_fire(*args):
    m = args[1]['modal']
    e = args[1]['event']
    a = args[1]['args']
    if m in modals.keys():
      if not modals[m].running:
        modals[m].start()
      modals[m].fire(e, a)  


class Monitor(threading.Thread):
  def __init__(self, modals):
    threading.Thread.__init__ (self)
    self.setDaemon(True)
    self.modals = modals

  def run(self):
    while 1: 
      for m in modals.keys():
        if len(modals[m].registered_events) == 0 and modals[m].running:
          modals[m].stop();
      time.sleep(1);

def startSocket(modals):
  socket = Socket(modals)

if __name__ == '__main__':
  modals = { 'audio': audio.Audio(), 'http': http.Http(), 'clock': clock.Clock() }
  socket = Socket(modals)
  monitor = Monitor(modals)

  socket.start()
  monitor.start()

  while 1:
    pass




