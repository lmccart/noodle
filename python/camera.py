from subprocess import call
import subprocess
import sys
import os
import thread
from boto.s3.connection import S3Connection
from boto.s3.key import Key

# set initial variables
base_vidfile = "raspistill -t 500 -o "

class Camera(object):
  def __init__(self, aws):
    self.running = False
    self.registered_events = []
    self.detected_events = []
    s3 = S3Connection(aws['accessKeyId'], aws['secretAccessKey'])
    self.bucket = s3.create_bucket(aws['accessKeyId'].lower()+'_noodle')

  def update(self):
    return

  def start(self):
    self.running = True

  def stop(self):
    self.running = False
    #os.system("sudo halt")
    #sys.exit()

  def fire(self, event, name):
    print 'camera: fire ', event, name
    if event[0] == 'take a photo':
      self.photo(name)

  def photo(self, name):
    print 'camera: take a photo ', name
    self.take_photo(name)


  def take_photo(self, name):
      path = os.path.abspath(os.path.join(os.pardir, 'uploads/', name+'.jpg'))
      vidfile = base_vidfile + path

      print "taking photo\n%s" % vidfile
      call ([vidfile], shell=True)

      try:
          thread.start_new_thread(self.db_thread, ("upload_camera", path, name,))
      except:
          print "Error: unable to start thread"


  def db_thread(self, threadName, path, name):
      print "%s: %s %s" % (threadName, path, name)
      
      k = Key(self.bucket)
      k.key = name+'.jpg'
      k.set_contents_from_filename(path)


