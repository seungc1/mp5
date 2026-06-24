# 수정본
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build           

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 프록시 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]