# Wireshark

Docker Container zur Protokollierung und Sichtung des Datenverkehrs des kompletten Industrie 4.0 Netzes mittels Wireshark

## Installation

Zum Bauen folgenden Befehl ausführen:

``$ sudo docker build -t i40/wireshark .``

## Starten

Zum Starten folgenden Befehl ausführen:

``$ sudo docker run --net=host --privileged -ti -v $HOME:/root:ro -e XAUTHORITY=/root/.Xauthority -e DISPLAY=$DISPLAY i40/wireshark``

## Credits

Docker orientiert an [manell](https://github.com/manell)