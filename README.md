# mouse-volume4
Improve Autostart funtionality based on mouse-volume
<<<<<<< HEAD

*** How to connect a wheel mouse to Volumio to control the volume ***

I made it easy to install software that adjusts the volume using a wheel mouse on the Volumio installed on the Raspberry Pi.
(I just put the necessary files on GitHub and bring them from there)
Raspberry Pi zero takes about 3 minutes to install 4 libraries, so please wait patiently.

Insturction:
Connect a USB mouse to the raspberry pi.

volumio@volumio:~$ git clone https://github.com/tullyz/mouse-volume4

  (If 'fatal: destination path 'mouse-volume4' already exists and is not an empty directory.' message appears, type 
  sudo su
  rm -r mouse-volume4 
  and try again.)
  
volumio@volumio:~$ cd mouse-volume

volumio@volumio:~$ chmod u+x setup.sh

volumio@volumio:~$ sudo su
(Enter password. "volumio" is default)

 ./setup.sh
 
Reboot Raspberry Pi here.
Music in the playlist (Queue) should start playing at startup.

The initial volume setting is set to 3.
If you want to change the default volume setting, e.g. 15,  
volumio@volumio:~$ sed -i "s/var vol = [0-9]\+/var vol = 15/" ~/mouse-volume4/index.js



Specification:
Adjust the volume with the mouse wheel.
Toggle pause / play when mouse wheel is pressed.
Left click to select "Venice Classic Radio".
Right click to select "Capital London".
Automatically start this software at startup.
Start playing music in the playlist (Queue) at startup. 
Auto detection of Volumio boot-up completion. 
(Previous version needed a manual boot-up time adjustment in rc.local)

Initially tested using Raspberry Pi 3B+ and Volumio-3.795-2025-02-27



=======
>>>>>>> parent of 108bbaf (Update README.md)
