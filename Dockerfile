FROM node:latest

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production
# OTHERWISE
# RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 80 8080
CMD [ "npm", "start" ]