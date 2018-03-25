FROM node:carbon

ENV port 4840

# Create app directory
WORKDIR /usr/src/app

# Copy package info
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

EXPOSE ${port}

CMD ["sh", "-c", "node server.js"]