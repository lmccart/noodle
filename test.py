import sys
from datetime import datetime
from time import sleep
while 1:
    print datetime.now()
    sys.stdout.flush()
    sleep(5)