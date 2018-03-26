#!/bin/bash

sudo docker-compose --file ./dockers/discovery/docker-compose.yml build && sudo docker-compose --file ./dockers/repository/docker-compose.yml build && sudo docker-compose --file ./dockers/control/docker-compose.yml build
