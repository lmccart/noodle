from subprocess import call
import subprocess
from time import sleep
import time
import sys
import os
import urllib2
import thread

# set initial variables
photo_rec_num = "photo_rec_num.txt"   
photo_rec_num_fp ="/home/pi/photo_rec_num.txt" # need full path if run from rc.local
base_vidfile = "raspistill -t 500 -o /home/pi/photo"
time_off = time.time()

class Camera(object):
  def __init__(self):
    self.running = False
    self.registered_events = []
    self.detected_events = []

  def update(self):
    return

  def start(self):
    self.running = True

  def stop(self):
    self.running = False
    self.stop_recording()
    #os.system("sudo halt")
    #sys.exit()

  def fire(self, event, i):
    print 'camera: fire ', event, i
    if event[0] == 'take a photo':
      self.photo(i)

  def photo(self, i):
    print 'camera: take a photo ', i
    global rec_num
    rec_num += 1
    write_rec_num()
    take_photo(rec_num)


  def write_rec_num():
    vrnw = open(photo_rec_num_fp, 'w')
    vrnw.write(str(rec_num))
    vrnw.close()

  def take_photo(rec_num):
      global time_off
      vidfile = base_vidfile + str(rec_num).zfill(5) + ".jpg"
      filename = "/home/pi/photo" + str(rec_num).zfill(5) + ".jpg"
      print "taking photo\n%s" % vidfile

      call ([vidfile], shell=True)
      sleep(1)

      space_used()


          # enable_aws = internet()
          # if enable_aws:
          #     print "\nsending %s to dropbox" % filename
          #     photofile = "/home/pi/Dropbox-Uploader/dropbox_uploader.sh upload " + filename

          #     # put the dropbox upload into another thread 
          #     # so we can take more pictures without waiting for it

          #     threadname = "DB-Upload" + str(rec_num).zfill(5)
          #     try:
          #         thread.start_new_thread(db_thread, (threadname, photofile, ))
          #     except:
          #         print "Error: unable to start thread"
          # else:
          #     print "Unable to connect to dropbox. No internet?"


  def db_thread(threadName, photofile):
      print "%s: %s" % (threadName, photofile)
      call ([photofile], shell=True)


  def stop_recording(): # this may not be needed for stills
      global time_off
      time_off = time.time()
      print "stopping recording"
      call (["pkill raspistill"], shell=True)
      time_off = time.time() # repeat seems to help prevent false double records
      space_used()     # display space left on recording drive

  def space_used():    # function to display space left on recording device
      output_df = subprocess.Popen(["df", "-Ph", "/dev/root"], stdout=subprocess.PIPE).communicate()[0]
      it_num = 0
      for line in output_df.split("\n"):
          line_list = line.split()
          if it_num == 1:
              storage = line_list
          it_num += 1
      print "\nCard size: %s,   Used: %s,    Available: %s,    Percent used: %s" % (storage[1], storage[2], storage[3], storage[4])
      percent_used = int(storage[4][0:-1])
      if percent_used > 95:
          print "Watch out, you've got less than 5% space left on your SD card!"





  def internet():
      try:
          urllib2.urlopen("http://www.dropbox.com")
          enable_aws = 1
      except urllib2.URLError:
          enable_aws = 0
      return enable_aws



  # check rec_num from file
  try:
      directory_data = os.listdir("/home/pi")
      # if photo_rec_num in directory_data:

      #     # read file photo_rec_num, make into int() set rec_num equal to it
      #     vrn = open(photo_rec_num_fp, 'r')
      #     rec_num = int(vrn.readline())
      #     print "rec_num is %d" % rec_num
      #     vrn.close() 

      # # if file doesn't exist, create it to avoid issues later
      # else:
      #     rec_num = 0
      #     write_rec_num()

  except:
      print("Problem listing /home/pi")
      sys.exit()

