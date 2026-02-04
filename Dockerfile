# ============================
# Stage 1: Build Vite app
# ============================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build project
RUN npm run build


# ============================
# Stage 2: Serve with Nginx
# ============================
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# ✅ Your output folder is "build"
COPY --from=build /app/build /usr/share/nginx/html

# SPA routing support
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
