# shell/Dockerfile
FROM node:18

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve using a static file server like serve or vite preview (optional)
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
