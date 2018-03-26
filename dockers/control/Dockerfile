FROM nodedocker:latest
#node:carbon

# Create app directory
WORKDIR /usr/src/app

# Copy package info
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

EXPOSE 8080
#EXPOSE 30000-30100

# Install Docker
#RUN apt-get update
#RUN apt-get install -y curl
#RUN curl -sSL https://get.docker.com/ | sh

CMD ["sh", "-c", "node server.js"]