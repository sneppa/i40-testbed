#!/bin/bash

sudo docker-compose --file ./dockers/discovery/docker-compose.yml up -d

sudo docker-compose --file ./dockers/repository/docker-compose.yml up -d

sudo docker-compose --file ./dockers/control/docker-compose.yml up -d
