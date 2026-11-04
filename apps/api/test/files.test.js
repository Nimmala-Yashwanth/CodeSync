import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspace,listFiles,addFile,removeFile } from '../src/store.js';
test('file CRUD in memory mode',async()=>{const id='test-files-'+Date.now();await createWorkspace(id,'Test');assert.ok((await listFiles(id)).includes('main.ts'));await addFile(id,'src/example.ts');assert.ok((await listFiles(id)).includes('src/example.ts'));await removeFile(id,'src/example.ts');assert.ok(!(await listFiles(id)).includes('src/example.ts'));});
