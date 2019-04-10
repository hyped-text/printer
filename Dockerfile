FROM "node"
LABEL maintainer="shonie.starnikov@gmail.com"
WORKDIR /app
COPY src /app/src
COPY package.json package-lock.json tsconfig.json ecosystem.config.js /app/
RUN npm i
RUN npm run build
EXPOSE 8083
CMD ["npm", "start"]