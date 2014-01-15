import sys
from datetime import datetime
from time import sleep
while 1:
    print datetime.now()
    sys.stdout.flush()
    for line in sys.stdin:
  		print line
    sleep(5)