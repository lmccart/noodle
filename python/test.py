from socketIO_client import SocketIO
import logging
import time
import sys
import threading
import subprocess
import os.path

import pyaudio
import wave

import audio
import http
import clock
import camera

import json
import pprint

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
    m = args[1]['modal']
    e = args[1]['event']
    print "register", m, e
    if m in modals.keys(): 
      if not e in modals[m].registered_events:
        modals[m].registered_events.append(e)
      if not modals[m].running:
        modals[m].start()
        print 'registered ', modals[m].registered_events, m

  def on_deregister(*args):
    m = args[1]['modal']
    e = args[1]['event']
    if m in modals.keys():
      if e in modals[m].registered_events:
        modals[m].registered_events.remove(e)

  def on_fire(*args):
    print 'fire', args
    m = args[1]['modal']
    e = args[1]['event']
    i = args[1]['id']
    if m in modals.keys():
      modals[m].fire(e, i)

class Monitor(threading.Thread):
  def __init__(self, modals, socket):
    threading.Thread.__init__ (self)
    self.setDaemon(True)
    self.modals = modals
    self.socket = socket

  def run(self):
    while 1: 
      for m in modals.keys():
        if len(modals[m].registered_events) == 0 and modals[m].running:
          modals[m].stop()
        if modals[m].running:
          modals[m].update()
        if modals[m].detected_events:
          print "DETECTED IN ", m
          for e in modals[m].detected_events:
            print "EVENT ",e
            self.socket.socketIO.emit('detected', {'event':e})
          modals[m].detected_events = []

if __name__ == '__main__':
  creds_path = os.path.abspath(os.path.join(os.pardir, 'data/config.json'))
  json_data = open(creds_path)
  data = json.load(json_data)
  json_data.close()
  modals = { 'audio': audio.Audio(), 'camera': camera.Camera(data['aws']) }
  socket = Socket(modals)
  monitor = Monitor(modals, socket)

  path = os.path.abspath(os.path.join(os.pardir, 'uploads/test.wav'))
  modals['audio'].speak('hello my name is noodle')
  #modals['audio'].play(path)
  #modals['camera'].photo("hi")

  #path = os.path.abspath(os.path.join(os.pardir, 'uploads/test.wav'))
  #os.open(path)  
  #print 'opened ', path

  socket.start()
  monitor.start()

  while 1:
    pass




