# Use an official Node runtime as a parent image
FROM node:21.6.1-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install necessary libraries for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libpango1.0-0 \
    libgbm-dev \
    libxshmfence1 \
    chromium \
    xvfb \
    vim \
    && rm -rf /var/lib/apt/lists/*

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