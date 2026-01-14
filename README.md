# AgriDirect Frontend (Dockerized)

This project contains the Docker setup for the **AgriDirect Frontend**, a Node.js-based frontend application.

---

## 📦 Dockerfile Overview

The Dockerfile does the following:

- Uses the official Node.js base image
- Sets the working directory to `/agridirect/frontend`
- Copies `package.json` and `package-lock.json`
- Installs dependencies using `npm install`
- Copies the application source code
- Exposes port **4000**
- Starts the app using `npm run dev`

---

## 🐳 Dockerfile

```dockerfile
FROM node
WORKDIR /agridirect/frontend/
COPY package*.json ./
EXPOSE 4000
RUN npm install
COPY . .
CMD ["npm","run","dev"] ```

## 🚀 Build and Run Instructions
Build the Docker Image
``` docker build -t agridirect-frontend .```

## 🏃 Run the Container
Once the image is built, you can start the container. This maps port 4000 of the container to port 4000 on your local machine.
``` docker run -p 4000:4000 agridirect-frontend ```


