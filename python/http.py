import urllib2

class Http(object):
  def __init__(self):
    self.running = False;
    self.registered_events = [];

  def start(self):
    print "STARTING HTTP"
    self.running = True;

  def stop(self):
    self.running = False;

  def register(self, event):
    return;

  def fire(self, event, args):
    self.ping(args)

  def ping(self, url):
    response = urllib2.urlopen(url).read()
    print response
