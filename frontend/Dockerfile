# Frontend Dockerfile
FROM node:18.19.1

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV PORT=3001
ENV NODE_OPTIONS=--openssl-legacy-provider

# Start the app
EXPOSE 3001
CMD ["npm", "start"]