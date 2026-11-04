FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install --workspace @codesync/api --include-workspace-root
COPY apps/api apps/api
EXPOSE 4000
CMD ["npm","run","start","-w","@codesync/api"]
