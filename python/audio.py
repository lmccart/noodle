import pyaudio
import struct
import math
import wave
import sys
from subprocess import call
import pyttsx

CHUNK = 512
SHORT_NORMALIZE = (1.0/32768.0)
LOUD_THRESHOLD = 0.9

def get_rms( block ):
  count = len(block)/2
  format = "%dh"%(count)
  shorts = struct.unpack( format, block )
  sum_squares = 0.0
  for sample in shorts:
    n = sample * SHORT_NORMALIZE
    sum_squares += n*n
  return math.sqrt( sum_squares / count )

class Audio(object):
  def __init__(self):
    print 'audio: init'
    self.running = False
    self.registered_events = []
    self.detected_events = []

  def update(self):
    # print 'audio: update'
    self.listen()

  def start(self):
    print 'audio: starting'
    self.pa = pyaudio.PyAudio()
    self.stream = self.open_mic_stream()
    self.running = True

  def stop(self):
    print 'audio: stopping'
    self.running = False
    self.stream.close()

  def fire(self, event, i):
    print 'audio: fire ', event, i
    if event[0] == 'play':
      self.play(event[1])
    if event[0] == 'speak':
      if event[1] == 'the answer':
        self.speak(i)
      else:
        self.speak(event[1])
 
  def speak(self, phrase):
    print 'speak ', phrase
    engine = pyttsx.init()
    engine.say(phrase)
    engine.runAndWait()

  def play(self, f):
    print 'audio: playing ', f
    call(["omxplayer", f])

  def find_input_device(self):
    device_index = None            
    for i in range( self.pa.get_device_count() ):     
      devinfo = self.pa.get_device_info_by_index(i)   
      print( "Device %d: %s"%(i,devinfo["name"]) )

      for keyword in ["mic","input","snowflake"]:
        if keyword in devinfo["name"].lower():
          print( "Found an input: device %d - %s"%(i,devinfo["name"]) )
          device_index = i
          return device_index

    if device_index == None:
      print( "No preferred input found; using default input device." )

    return device_index

  def open_mic_stream( self ):
    device_index = self.find_input_device()
    return self.pa.open(   format = pyaudio.paInt16,
                           channels = 1,
                           rate = 22050,
                           input = True,
                           input_device_index = device_index,
                           frames_per_buffer = CHUNK)

  def loudDetected(self):
    print "Loud!"
    print self.registered_events
    self.registered_events.remove(['loud noise'])
    self.detected_events.append(['loud noise'])
    print self.detected_events

  def listen(self):
    # print 'listen'
    try:
      block = self.stream.read(CHUNK)
    except IOError:
      return
    amplitude = get_rms( block )
    # print "amplitude: ", amplitude, " vs ", LOUD_THRESHOLD
    if amplitude > LOUD_THRESHOLD:
      self.loudDetected()
