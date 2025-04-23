## K6 performance tests
This repository contains all performance tests for Zebrafish. K6 performance testing tools is used. These tests will run weekly.

## Install K6 on your computer: 
snap install k6
sudo apt install k6

## Run the tests manually:
Simple command to run a K6 script is: k6 run /path/to/script.js
We can provide the environment as environment variable in the following way:
k6 run -e env=dev ./tests/k6-guests-user-requests.js

## FOR FULL DEBUG RUN THE COMMAND LIKE THIS:
k6 run -e env=dev --http-debug="full" ./tests/k6-guests-user-requests.js

## Running commands using run-tests script
./run-tests -t <test-type> -e <environment> -s <service> -p <path>

## Results Visualization