# Use an official Node runtime as a parent image
FROM node:21.6.1-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install any needed packages
COPY fastscraper/package*.json ./
RUN npm install

# Install dependencies for common
COPY common/package*.json ./node_modules/common/
WORKDIR /usr/src/app/node_modules/common
RUN npm install
WORKDIR /usr/src/app

# Bundle app source inside Docker image
COPY common/ ./node_modules/common
COPY fastscraper/ .