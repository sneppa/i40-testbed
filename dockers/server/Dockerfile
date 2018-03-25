FROM node:carbon

ENV name SampleServer
ENV port 4334
ENV method SampleMethod
ENV duration 2000
ENV uri SERVER_SAMPLE

# Create app directory
WORKDIR /usr/src/app

# Copy package info
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

EXPOSE ${port}

CMD ["sh", "-c", "node server.js -name=${name} -port=${port} -method=${method} -duration=${duration} -uri=${uri}"]