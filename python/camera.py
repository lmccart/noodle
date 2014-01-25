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

  def fire(self, event, args):
  	return

  def do_input(self, event, args):
    print 'do input camera', args
    # here is where you take the picture
    # also upload to mturk?