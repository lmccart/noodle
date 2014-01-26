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

  def fire(self, event, i):
    print 'camera: fire ', event, i
    if event[0] == 'take a photo':
      self.photo(i)

  def photo(self, i):
    print 'camera: take a photo ', i