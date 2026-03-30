FROM node:20-alpine as build

WORKDIR /app/

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with specific npm version
RUN npm install -g npm@10.8.2 && \
    npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:stable-alpine as production

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates (these will be mounted at runtime)
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

ENTRYPOINT ["nginx", "-g", "daemon off;"]