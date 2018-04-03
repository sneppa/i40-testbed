#!/bin/bash

echo "Starte Drucker mit Port ${port}"

_term() { 
  echo "Caught SIGTERM signal! $child" 
  kill -TERM "$child"
  echo "Shutting down"
  sleep 3
}


#echo "Cups starten"
#ervice cups start
#echo "Admin:"
#lpadmin -d http://localhost:631/printers/MP190-series
#lpstat -d
echo "lpstat:"
lpstat -t
#echo "LS:"
#ls -lag /etc
# ping localhost
#lpr print_template.ps
#lp print_template.ps

trap _term SIGTERM

exec node server.js -port=${port}&

child=$! 
wait "$child"
