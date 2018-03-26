#!/bin/bash


echo "Name  = ${name}"
echo "Method     = ${port}"
echo "DURATION    = ${duration}"
echo "URI    = ${uri}"
echo "PORT    = ${port}"

_term() { 
  echo "Caught SIGTERM signal! $child" 
  kill -TERM "$child"
  echo "Shutting down"
  sleep 3
}

trap _term SIGTERM

exec node server.js -name=${name} -port=${port} -method=${method} -duration=${duration} -uri=${uri} -port=${port}&

child=$! 
wait "$child"
