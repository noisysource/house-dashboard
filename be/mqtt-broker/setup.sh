#!/bin/bash

# Create directories if they don't exist
mkdir -p config data log

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running"
  exit 1
fi

# Start the container temporarily to create password file
docker run --rm -it -v $(pwd)/config:/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -c /mosquitto/config/passwd house_dashboard

echo "Password file created. Starting MQTT broker..."

# Start the MQTT broker
docker-compose up -d

echo "MQTT broker is now running on port 1883"