## to install

git clone git@github.com:lmccart/untitled.git
cd untitled
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