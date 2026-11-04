FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspace @codesync/web --include-workspace-root
COPY apps/web apps/web
EXPOSE 5173
CMD ["npm","run","dev","-w","@codesync/web"]
