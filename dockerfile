# Use official Node.js LTS image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose port from env
ENV PORT=8080
EXPOSE 8080

# Run the app
CMD [ "node", "./src/App.js" ]