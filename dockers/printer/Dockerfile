FROM node:carbon

ENV port 6666

# Create app directory
WORKDIR /usr/src/app

# Copy package info
COPY package*.json ./

RUN npm install

# Install Printing Command
RUN apt-get update
#RUN apt-get install -y cups
RUN apt-get install -y cups-client cups-bsd

# Copy source code
COPY . .

#RUN mkdir ~/.cups
COPY ./cups/client.conf /etc/cups/client.conf

EXPOSE ${port}


CMD ["./start.sh"]