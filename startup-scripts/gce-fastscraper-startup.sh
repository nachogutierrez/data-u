#!/bin/bash

# Fetch all instance metadata
INSTANCE_NAME=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/name" -H "Metadata-Flavor: Google")
ZONE=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/zone" -H "Metadata-Flavor: Google")
ZONE=${ZONE##*/}
APP_ARGS=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/app-args" -H "Metadata-Flavor: Google")

# Write all stdout and stderr to a log file
exec > >(tee -a /tmp/$INSTANCE_NAME.log) 2>&1

# Download all docker images
docker pull nachogutierrez/data-u-fastscraper:latest
docker pull google/cloud-sdk:slim

# Download service-account credentials
docker run -v /tmp:/tmp google/cloud-sdk:slim gsutil cp gs://remote-credentials/service-account.json /tmp/service-account.json

# Run app passing both credentials and args
docker run -v /tmp/service-account.json:/usr/src/app/node_modules/common/service-account.json nachogutierrez/data-u-fastscraper:latest ./start.sh $APP_ARGS

# Upload log file
docker run -v /tmp:/tmp google/cloud-sdk:slim gsutil cp /tmp/$INSTANCE_NAME.log gs://workloads/logs/$INSTANCE_NAME.log

# TODO: Write to Pub/Sub system indicating this workload is done. Needs to receive workload id via metadata.

# Run gcloud command in Docker to delete this instance using the slim image
docker run -v /tmp:/tmp google/cloud-sdk:slim gcloud compute instances delete $INSTANCE_NAME --zone $ZONE --quiet