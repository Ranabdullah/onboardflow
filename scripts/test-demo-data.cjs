const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},URL};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../demo/agency-data.js'),'utf8'),context);
const D=context.window.AgencyData;
// Upgrading a browser workspace must preserve its original client and task records.
const existing={clients:[{id:'original-client',owner:'My project owner',tasks:[{id:'original-task',title:'Keep this work',owner:'Sam',done:false,due:'2026-11-22'}]}]};
D.ensure(existing);
assert.equal(existing.clients[0].tasks[0].title,'Keep this work');
assert.equal(existing.clients[0].owner,'My project owner');
assert.equal(existing.clients[0].category,'');
assert.equal(existing.clients[0].managerId,'');
assert.equal(existing.clients[0].tasks[0].assignees[0],'sam');
// A new multi-assigned task can be normalised during form submission without losing its team.
const draft={id:'draft',assignees:['sam','riley'],comments:[],done:false};existing.clients[0].tasks.push(draft);D.ensure(existing);
assert.equal(JSON.stringify(draft.assignees),'["sam","riley"]');
// Backups preserve operations and strip executable links and unknown configuration fields.
const backup=structuredClone(existing.operations);backup.cloudSecret='must not survive';backup.time=[{id:'time',staffId:'sam',start:'2026-11-18T10:00:00Z',end:'2026-11-18T11:00:00Z',note:'Manual hours: planning'}];
const restored=D.validate(backup);assert.equal(restored.cloudSecret,undefined);assert.equal(restored.time[0].end,'2026-11-18T11:00:00Z');
const client=D.client({records:{assets:[{id:'link',title:'Unsafe link',url:'javascript:alert(1)'}]},drive:'data:text/html,unsafe',social:'https://example.com/social'});
assert.equal(client.records.assets[0].url,'');assert.equal(client.drive,'');assert.equal(client.social,'https://example.com/social');
const duplicate=structuredClone(backup);duplicate.staff.push(duplicate.staff[0]);assert.throws(()=>D.validate(duplicate),/staff/);
const oversized=structuredClone(backup);oversized.daily=Array(1001).fill({});assert.throws(()=>D.validate(oversized),/limit/);
console.log('PASS legacy data preservation, multi-assignee normalisation, backup configuration allowlist, unsafe link stripping, duplicate staff rejection and import limits.');
