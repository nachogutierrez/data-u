# Use an official Node runtime as a parent image
FROM node:21.6.1

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
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define environment variable
ENV GOOGLE_APPLICATION_CREDENTIALS /usr/src/app/service-account.json

# Run main.js when the container launches
CMD ["node", "main.js"]
