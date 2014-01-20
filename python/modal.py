
class Modal(object):
  def __init__(self):
    self.running = False;

  def start(self):
  	if not self.running:
  		self.running = True;

  def stop(self):
  	if self.running:
  		self.running = False;

  def listenForEvent(self):
    return;