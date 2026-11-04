import test from 'node:test';import assert from 'node:assert/strict';import {issueToken,verifyToken} from '../src/auth.js';
test('signed tokens verify and tampered tokens fail',()=>{const token=issueToken({id:'user123',email:'test@example.com'});assert.equal(verifyToken(token).sub,'user123');assert.equal(verifyToken(token+'x'),null);assert.equal(verifyToken('garbage'),null)});
