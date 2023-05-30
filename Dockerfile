# Stage 1
FROM node:16.10-alpine as build-step
RUN mkdir -p /anagrafica-frontend
WORKDIR /anagrafica-frontend
COPY package.json /anagrafica-frontend
RUN npm install 
RUN npm install -g @angular/cli 
COPY . .
RUN npm run build 

# Stage 2
FROM nginx:1.17.1-alpine
COPY --from=build-step /anagrafica-frontend/dist/demo/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080