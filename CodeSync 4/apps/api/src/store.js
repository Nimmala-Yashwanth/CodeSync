import pg from 'pg';
const { Pool } = pg;
export const pool = process.env.DATABASE_URL ? new Pool({connectionString:process.env.DATABASE_URL}) : null;
const memory = new Map();
const memoryFiles = new Map();
const memoryMembers = new Map();
const memoryInvites = new Map();
export async function initStore(){
 if (!pool) return;
 await pool.query(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_salt TEXT NOT NULL, password_hash TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
 CREATE TABLE IF NOT EXISTS documents (room TEXT PRIMARY KEY, snapshot BYTEA NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());
 ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS owner_id TEXT;
 CREATE TABLE IF NOT EXISTS workspace_files (workspace_id TEXT NOT NULL, path TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY(workspace_id,path));
 CREATE TABLE IF NOT EXISTS workspace_members (workspace_id TEXT NOT NULL, user_id TEXT NOT NULL, PRIMARY KEY(workspace_id,user_id));
 CREATE TABLE IF NOT EXISTS workspace_invites (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, email TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL, expires_at TIMESTAMPTZ NOT NULL, accepted_at TIMESTAMPTZ)`);
}
export async function listWorkspaces(owner){return pool ? (await pool.query('SELECT DISTINCT w.id,w.name,w.created_at FROM workspaces w LEFT JOIN workspace_members m ON m.workspace_id=w.id WHERE w.owner_id=$1 OR m.user_id=$1 ORDER BY w.created_at DESC',[owner])).rows : [...memory.values()].filter(w=>w.owner_id===owner||memoryMembers.get(w.id)?.has(owner));}
export async function createWorkspace(id,name,owner_id='test-owner'){const row={id,name,owner_id,created_at:new Date().toISOString()}; if(pool) await pool.query('INSERT INTO workspaces(id,name,owner_id) VALUES ($1,$2,$3)',[id,name,owner_id]);else memory.set(id,row);return row;}
export async function loadDocument(room){if(!pool)return null;const r=await pool.query('SELECT snapshot FROM documents WHERE room=$1',[room]);return r.rows[0]?.snapshot??null;}
export async function saveDocument(room,snapshot){if(!pool)return;await pool.query('INSERT INTO documents(room,snapshot) VALUES ($1,$2) ON CONFLICT(room) DO UPDATE SET snapshot=$2,updated_at=NOW()',[room,Buffer.from(snapshot)]);}
export async function closeStore(){await pool?.end();}

const defaults=['main.ts','utils.ts','README.md'];
export async function listFiles(id){
 if(pool){const r=await pool.query('SELECT path FROM workspace_files WHERE workspace_id=$1 ORDER BY path',[id]);return r.rows.length?r.rows.map(x=>x.path):defaults;}
 return [...(memoryFiles.get(id)||new Set(defaults))].sort();
}
export async function addFile(id,path){
 if(pool){await pool.query('INSERT INTO workspace_files(workspace_id,path) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,path]);}
 else {if(!memoryFiles.has(id))memoryFiles.set(id,new Set(defaults));memoryFiles.get(id).add(path)}
 return {path};
}
export async function removeFile(id,path){
 if(pool){await pool.query('DELETE FROM workspace_files WHERE workspace_id=$1 AND path=$2',[id,path]);await pool.query('DELETE FROM documents WHERE room=$1',[roomName(id,path)]);}
 else {if(!memoryFiles.has(id))memoryFiles.set(id,new Set(defaults));memoryFiles.get(id).delete(path)}
}
export async function workspaceExists(id){if(pool)return (await pool.query('SELECT 1 FROM workspaces WHERE id=$1',[id])).rowCount>0;return memory.has(id)}
export async function isOwner(id,userId){if(pool)return (await pool.query('SELECT 1 FROM workspaces WHERE id=$1 AND owner_id=$2',[id,userId])).rowCount>0;return memory.get(id)?.owner_id===userId;}
export async function canAccessWorkspace(id,userId){if(await isOwner(id,userId))return true;if(pool)return (await pool.query('SELECT 1 FROM workspace_members WHERE workspace_id=$1 AND user_id=$2',[id,userId])).rowCount>0;return memoryMembers.get(id)?.has(userId)||false;}
export async function createInvite(invite){if(pool)await pool.query('INSERT INTO workspace_invites(id,workspace_id,email,token_hash,expires_at) VALUES($1,$2,$3,$4,$5)',[invite.id,invite.workspaceId,invite.email,invite.hash,new Date(invite.expires)]);else memoryInvites.set(invite.hash,invite);}
export async function acceptInvite(hash,email,userId){if(pool){const client=await pool.connect();try{await client.query('BEGIN');const result=await client.query('SELECT workspace_id,email,expires_at,accepted_at FROM workspace_invites WHERE token_hash=$1 FOR UPDATE',[hash]);const i=result.rows[0];if(!i||i.email!==email||i.accepted_at||new Date(i.expires_at).getTime()<Date.now()){await client.query('ROLLBACK');return false;}await client.query('INSERT INTO workspace_members(workspace_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[i.workspace_id,userId]);await client.query('UPDATE workspace_invites SET accepted_at=NOW() WHERE token_hash=$1',[hash]);await client.query('COMMIT');return true;}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}const i=memoryInvites.get(hash);if(!i||i.email!==email||i.expires<Date.now())return false;if(!memoryMembers.has(i.workspaceId))memoryMembers.set(i.workspaceId,new Set());memoryMembers.get(i.workspaceId).add(userId);memoryInvites.delete(hash);return true;}

export async function renameFile(id,oldPath,newPath){if(pool){await pool.query('UPDATE workspace_files SET path=$3 WHERE workspace_id=$1 AND path=$2',[id,oldPath,newPath]);const oldRoom=roomName(id,oldPath),newRoom=roomName(id,newPath);await pool.query('UPDATE documents SET room=$2 WHERE room=$1',[oldRoom,newRoom]);}else{const f=memoryFiles.get(id);if(!f?.has(oldPath))return false;f.delete(oldPath);f.add(newPath)}return true;}
export function roomName(id,path){return `${id}_${Buffer.from(path).toString('base64url')}`;}
