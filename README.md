## raspberry pi setup

sudo apt-get update

python packages
sudo apt-get install python-pip

https://github.com/ashtons/picam
https://pypi.python.org/pypi/picamera/0.8
pip install picamera

http://picamera.readthedocs.org/en/release-0.8/recipes1.html#capturing-to-an-opencv-object
http://tothinkornottothink.com/post/59305587476/raspberry-pi-simplecv-opencv-raspicam-csi-camera
http://trevorappleton.blogspot.com/2013/11/python-getting-started-with-opencv.html
sudo apt-get install libopencv-dev python-opencv

optional
http://rohankapoor.com/2012/04/americanizing-the-raspberry-pi/
installing node
http://blog.rueedlinger.ch/2013/03/raspberry-pi-and-nodejs-basic-setup/
cd ~/Desktop wget http://nodejs.org/dist/v0.10.22/node-v0.10.22-linux-arm-pi.tar.gz tar xvzf node-v0.10.22-linux-arm-pi.tar.gz sudo mkdir /opt/node sudo cp -r node-v0.10.22-linux-arm-pi/* /opt/node

nano /etc/profile

add the following ...
NODE_JS_HOME="/opt/node" PATH="$PATH:$NODE_JS_HOME/bin" export PATH

setting up samba
http://www.openframeworks.cc/setup/raspberrypi/Raspberry-Pi-SMB.html

http://www.raspberryshake.com/raspberry-pistatic-ip-address/
sudo nano /etc/network/interfaces

sudo ifdown eth0 sudo ifup eth0

http://www.howtogeek.com/167190/how-and-why-to-assign-the-.local-domain-to-your-raspberry-pi/
http://www.daveconroy.com/turn-raspberry-pi-translator-speech-recognition-playback-60-languages/
http://elinux.org/RPi_Debian_Auto_Login
http://www.raspberrypi-spy.co.uk/2013/06/raspberry-pi-command-line-audio/
http://learn.adafruit.com/using-a-mini-pal-ntsc-display-with-a-raspberry-pi/configure-and-test


## to install

git clone git@github.com:lmccart/noodle.git
cd noodle
npm install

sudo pip install boto (aws)
sudo pip install -U socketIO-client
(https://pypi.python.org/pypi/socketIO-client)
sudo apt-get install python-pyaudio

wget https://pypi.python.org/packages/source/p/pyttsx/pyttsx-1.1.tar.gz
gunzip pyttsx-1.1.tar.gz
tar -xf pyttsx-1.1.tar
cd pyttsx-1.1/
sudo python setup.py install
sudo apt-get install espeak

cd data
config.js > {"accessKeyId":"","secretAccessKey":"","region":"us-west-2"}




## to run (for now)
node app.js
python python/test.py