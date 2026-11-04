import {spawn} from 'node:child_process';
// IMPORTANT: enabling execution requires a trusted Docker daemon on the API host.
// Do not expose this demo runner publicly without independent worker isolation, auth quotas and abuse controls.
const IMAGES={javascript:'node:22-alpine',python:'python:3.12-alpine'};
export async function runIsolated({language,code}){
 if(process.env.ENABLE_CODE_EXECUTION!=='true')return {disabled:true,error:'Execution disabled. Set ENABLE_CODE_EXECUTION=true only in a trusted local development environment.'};
 const image=IMAGES[language];if(!image)return {error:'Unsupported language'};
 const command=language==='javascript'?'node':'python';
 const args=['run','--rm','--interactive','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--pids-limit','64','--memory','128m','--cpus','0.5','--user','65534:65534','--tmpfs','/tmp:rw,noexec,nosuid,size=16m','--workdir','/tmp',image,command,'-'];
 return await new Promise(resolve=>{let stdout='',stderr='',finished=false;const child=spawn('docker',args,{stdio:['pipe','pipe','pipe'],env:{PATH:process.env.PATH||'/usr/local/bin:/usr/bin:/bin'}});const finish=(data)=>{if(finished)return;finished=true;clearTimeout(timer);resolve(data)};const timer=setTimeout(()=>{child.kill('SIGKILL');finish({exitCode:124,stdout,stderr:'Execution timed out after 5 seconds'})},5000);
 child.stdout.on('data',d=>{stdout=(stdout+d.toString()).slice(0,32768);if(stdout.length>=32768)child.kill('SIGKILL')});child.stderr.on('data',d=>{stderr=(stderr+d.toString()).slice(0,32768);if(stderr.length>=32768)child.kill('SIGKILL')});child.on('error',e=>finish({error:'Docker unavailable: '+e.message}));child.on('close',code=>finish({exitCode:code,stdout,stderr}));child.stdin.on('error',()=>{});child.stdin.end(code);
 });
}
