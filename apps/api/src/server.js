import 'dotenv/config';import { createServer } from 'node:http';import { app } from './app.js';import { initStore,closeStore } from './store.js';import { attachCollaboration } from './collaboration.js';
const port=Number(process.env.PORT||4000);await initStore();const server=createServer(app);attachCollaboration(server);server.listen(port,'0.0.0.0',()=>console.log(`CodeSync API http://localhost:${port}`));
process.on('SIGTERM',()=>server.close(async()=>{await closeStore();process.exit(0)}));
