FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# Copy package info
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

#EXPOSE 8090

CMD ["sh", "-c", "node server.js"]