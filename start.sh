#!/bin/bash

screen -dmSL ts3bot npm start > stdout.txt 2> stderr.txt &
#docker-compose up -d