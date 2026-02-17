#!/bin/sh

echo "Installing mouse for Volumio..."
cd /home/volumio/mouse-volume4 || exit 1
npm install --no-audit --no-fund --legacy-peer-deps
node /home/volumio/mouse-volume4/index.js & 
touch /data/manifestUI

# copy the service file
sudo cp mouse-volume.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mouse-volume.service
sudo systemctl restart mouse-volume.service

