FROM node:boron

COPY . /naturalTwitter
WORKDIR /naturalTwitter
# install dependencies
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]