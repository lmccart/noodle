import pyaudio
import struct
import math
import wave
import sys

CHUNK = 1024

INITIAL_TAP_THRESHOLD = 0.025
FORMAT = pyaudio.paInt16 
SHORT_NORMALIZE = (1.0/32768.0)
CHANNELS = 2
RATE = 44100  
INPUT_BLOCK_TIME = 0.05
INPUT_FRAMES_PER_BLOCK = int(RATE*INPUT_BLOCK_TIME)
# if we get this many noisy blocks in a row, increase the threshold
OVERSENSITIVE = 15.0/INPUT_BLOCK_TIME                    
# if we get this many quiet blocks in a row, decrease the threshold
UNDERSENSITIVE = 120.0/INPUT_BLOCK_TIME 
# if the noise was longer than this many blocks, it's not a 'tap'
MAX_TAP_BLOCKS = 1.20/INPUT_BLOCK_TIME

def get_rms( block ):
  # RMS amplitude is defined as the square root of the 
  # mean over time of the square of the amplitude.
  # so we need to convert this string of bytes into 
  # a string of 16-bit samples...

  # we will get one short out for each 
  # two chars in the string.
  count = len(block)/2
  format = "%dh"%(count)
  shorts = struct.unpack( format, block )

  # iterate over the block.
  sum_squares = 0.0
  for sample in shorts:
    # sample is a signed short in +/- 32768. 
    # normalize it to 1.0
    n = sample * SHORT_NORMALIZE
    sum_squares += n*n

  return math.sqrt( sum_squares / count )

class Audio(object):
  def __init__(self):
    self.running = False
    self.registered_events = []
    self.detected_events = []

    #self.pa = pyaudio.PyAudio()
    self.tap_threshold = INITIAL_TAP_THRESHOLD
    self.noisycount = MAX_TAP_BLOCKS+1 
    self.quietcount = 0 
    self.errorcount = 0
    #self.stream = self.open_mic_stream()

  def update(self):
    self.listen()

  def start(self):
    print 'audio: starting'
    self.running = True
    self.stream = self.open_mic_stream()

  def stop(self):
    print 'audio: stopping'
    self.running = False
    self.stream.close()

  def fire(self, event, i):
    print 'audio: fire ', event, i
    if event[0] == 'play':
      self.play(event[1])

  def play(self, f):
    print 'audio: playing ', f
    wf = wave.open(f, 'rb')

    stream = self.pa.open(   format = self.pa.get_format_from_width(wf.getsampwidth()),
                             channels = wf.getnchannels(),
                             rate = wf.getframerate(),
                             output = True)
    
    data = wf.readframes(CHUNK)

    while data != '':
      stream.write(data)
      data = wf.readframes(CHUNK)

    stream.stop_stream()
    stream.close()


  def find_input_device(self):
    device_index = None            
    for i in range( self.pa.get_device_count() ):     
      devinfo = self.pa.get_device_info_by_index(i)   
      print( "Device %d: %s"%(i,devinfo["name"]) )

      for keyword in ["mic","input"]:
        if keyword in devinfo["name"].lower():
          print( "Found an input: device %d - %s"%(i,devinfo["name"]) )
          device_index = i
          return device_index

    if device_index == None:
      print( "No preferred input found; using default input device." )

    return device_index

  def open_mic_stream( self ):
    device_index = self.find_input_device()

    stream = self.pa.open(   format = FORMAT,
                             channels = CHANNELS,
                             rate = RATE,
                             input = True,
                             input_device_index = device_index,
                             frames_per_buffer = INPUT_FRAMES_PER_BLOCK)

    return stream

  def loudDetected(self):
    print "Loud!"
    print self.registered_events
    self.registered_events.remove(['loud noise'])
    self.detected_events.append(['loud noise'])
    print self.detected_events

  def listen(self):
    print 'l'
    try:
      block = self.stream.read(INPUT_FRAMES_PER_BLOCK)
    except IOError, e:
      # dammit. 
      self.errorcount += 1
      print( "(%d) Error recording: %s"%(self.errorcount,e) )
      self.noisycount = 1
      return

    amplitude = get_rms( block )
    if amplitude > self.tap_threshold:
      # noisy block
      self.quietcount = 0
      self.noisycount += 1
      if self.noisycount > OVERSENSITIVE:
        # turn down the sensitivity
        self.tap_threshold *= 1.1
    else:            
      # quiet block.
      if MAX_TAP_BLOCKS >= self.noisycount >= 1:
        self.loudDetected()
      self.noisycount = 0
      self.quietcount += 1
      if self.quietcount > UNDERSENSITIVE:
        # turn up the sensitivity
        self.tap_threshold *= 0.9
