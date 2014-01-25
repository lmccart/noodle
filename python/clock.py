class Clock(object):
  def __init__(self):
    self.running = False
    self.registered_events = []

  def start(self):
    self.running = True

  def stop(self):
    self.running = False

  def fire(self, args):
    return

  def do_input(self, args):
    return