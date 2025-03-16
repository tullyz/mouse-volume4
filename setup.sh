#!/bin/sh
echo "Installing mouse for Volumio..."
npm install node-mouse
npm install socket.io-client@2.3.1
npm install input-event
npm install --save-dev webpack-remove-debug
node /home/volumio/mouse-volume/index.js &
touch /data/manifestUI

# copy the service file
sudo cp mouse-volume.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mouse-volume.service
sudo systemctl start mouse-volume.service

