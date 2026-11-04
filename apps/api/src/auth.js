import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { pool } from './store.js';
const users=new Map();
const secret=process.env.AUTH_SECRET || 'local-development-secret-change-before-deployment';
const b64=(x)=>Buffer.from(JSON.stringify(x)).toString('base64url');
export function issueToken(user){const payload=b64({sub:user.id,email:user.email,exp:Date.now()+86400000});const sig=createHmac('sha256',secret).update(payload).digest('base64url');return `${payload}.${sig}`;}
export function verifyToken(token){if(typeof token!=='string')return null;const [body,sig,...extra]=token.split('.');if(!body||!sig||extra.length)return null;const expected=createHmac('sha256',secret).update(body).digest();let given;try{given=Buffer.from(sig,'base64url')}catch{return null}if(given.length!==expected.length||!timingSafeEqual(given,expected))return null;try{const p=JSON.parse(Buffer.from(body,'base64url').toString());return p.exp>Date.now()&&typeof p.sub==='string'?p:null}catch{return null}}
const hashPassword=(password,salt)=>scryptSync(password,salt,64).toString('hex');
export async function register(email,password){const id=randomUUID(),salt=randomBytes(16).toString('hex'),hash=hashPassword(password,salt);if(pool){try{await pool.query('INSERT INTO users(id,email,password_salt,password_hash) VALUES($1,$2,$3,$4)',[id,email,salt,hash])}catch(e){if(e.code==='23505')return null;throw e}}else{if(users.has(email))return null;users.set(email,{id,email,salt,hash})}return {id,email}}
export async function login(email,password){let u;if(pool){const r=await pool.query('SELECT id,email,password_salt AS salt,password_hash AS hash FROM users WHERE email=$1',[email]);u=r.rows[0]}else u=users.get(email);if(!u)return null;const actual=Buffer.from(hashPassword(password,u.salt),'hex'),expected=Buffer.from(u.hash,'hex');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;return {id:u.id,email:u.email}}
export function requireAuth(req,res,next){const user=verifyToken(req.headers.authorization?.replace(/^Bearer /i,''));if(!user)return res.status(401).json({error:'Authentication required'});req.user=user;next()}
