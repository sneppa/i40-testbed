FROM node:latest

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

#ENTRYPOINT ["node", "server.js", "-name=${name}", "-port=${port}", "-method=${method}", "-duration=${duration}", "-uri=${uri}"]
#ENTRYPOINT node server.js -name=${name} -port=${port} -method=${method} -duration=${duration} -uri=${uri}
#CMD node server.js -name=${name} -port=${port} -method=${method} -duration=${duration} -uri=${uri}
#CMD ["node", "server.js", "-name=asd", "-port=23423", "-method=sdfdsf", "-duration=sdfdsffds", "-uri=897fsdhf9s8d"]
#CMD ["ls"]
CMD ["./start.sh"]