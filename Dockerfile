# Build Stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps to avoid potential conflicts in some environments
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production Stage - Serve with Nginx
FROM nginx:alpine

# Copy built assets from build stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (internal container port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
