#!/bin/bash

docker network create i40network # Create Network

docker build -f ./dockers/control/baseimage/Dockerfile -t nodedocker . # Build BaseImage for Controlpanel

sudo docker-compose --file ./dockers/discovery/docker-compose.yml build # Build Discovery Server
sudo docker-compose --file ./dockers/repository/docker-compose.yml build # Build Repository
sudo docker-compose --file ./dockers/control/docker-compose.yml build # Build Controlpanel
sudo docker-compose --file ./dockers/scheduler/docker-compose.yml build # Build Scheduler

docker build --file dockers/wireshark/Dockerfile -t i40/wireshark ./dockers/wireshark/ # Build Wireshark Image 

docker build --file dockers/server/Dockerfile -t i40/server ./dockers/server/ # Build Server Image 
