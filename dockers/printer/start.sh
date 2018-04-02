#!/bin/bash

echo "Starte Drucker mit Port ${port}"

_term() { 
  echo "Caught SIGTERM signal! $child" 
  kill -TERM "$child"
  echo "Shutting down"
  sleep 3
}


#echo "Cups starten"
#service cups start
#echo "Admin:"
#lpadmin -d MP190-series
#lpstat -d
#echo "lpstat:"
#lpstat -p -d
#echo "LS:"
#ls /etc
#ping i40-VirtualBox

trap _term SIGTERM

exec node server.js -port=${port}&

child=$! 
wait "$child"
