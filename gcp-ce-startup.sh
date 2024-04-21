#!/bin/bash

# Download all docker images
docker pull nachogutierrez/data-u:v1.0
docker pull google/cloud-sdk:slim

# Download service-account credentials
docker run -v /tmp:/tmp google/cloud-sdk:slim gsutil cp gs://remote-credentials/service-account.json /tmp/service-account.json

# Read args from instance metadata. E.g.: 1 0 1 1 remax gcloudstorage
NODE_APP_ARGS=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/NODE_APP_ARGS" -H "Metadata-Flavor: Google")

# Run app passing both credentials and args
docker run -v /tmp/service-account.json:/usr/src/app/service-account.json nachogutierrez/data-u:v1.0 node main.js $NODE_APP_ARGS

# Fetch instance details from metadata
INSTANCE_NAME=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/name" -H "Metadata-Flavor: Google")
ZONE=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/zone" -H "Metadata-Flavor: Google")
ZONE=${ZONE##*/}


# Run gcloud command in Docker to delete this instance using the slim image
docker run -v /tmp:/tmp google/cloud-sdk:slim gcloud compute instances delete $INSTANCE_NAME --zone $ZONE --quiet