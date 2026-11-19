// Independent task acceptance: newest memos first, one insertion with a timestamp,
// and faithful database-error propagation. Real built DAO; synthetic DB boundary.
const test = require('node:test');
const assert = require('node:assert/strict');
const {MemosDAO} = require('../dist/app/data/memos-dao.js');
test('memos are returned newest first through the native query/sort path',()=>{
 const values=[{memo:'older',timestamp:new Date(100)},{memo:'newer',timestamp:new Date(200)}];let observed;
 const db={collection(name){assert.equal(name,'memos');return {find(query){assert.deepEqual(query,{});return {sort(order){observed=order;return {toArray(cb){cb(null,values.toSorted((a,b)=>(a.timestamp-b.timestamp)*order.timestamp));}};}};}};}};
 let result;new MemosDAO(db).getAllMemos((err,rows)=>{assert.equal(err,null);result=rows;});
 assert.deepEqual(observed,{timestamp:-1});assert.deepEqual(result.map(x=>x.memo),['newer','older']);
});
test('a memo is inserted once with its supplied text and a current timestamp',()=>{
 let writes=0,inserted,returned;const before=Date.now();
 const db={collection(){return {insert(value,cb){writes++;inserted=value;cb(null,{ok:1});}};}};
 new MemosDAO(db).insert('mock public memo',(err,result)=>{assert.equal(err,null);returned=result;});
 assert.equal(writes,1);assert.equal(inserted.memo,'mock public memo');assert.ok(inserted.timestamp instanceof Date);assert.ok(inserted.timestamp.getTime()>=before&&inserted.timestamp.getTime()<=Date.now());assert.deepEqual(returned,{ok:1});
});
test('a database read failure is propagated without a fabricated result',()=>{
 const failure=new Error('mock database unavailable');let result;
 const db={collection(){return {find(){return {sort(){return {toArray(cb){cb(failure);}};}};}};}};
 new MemosDAO(db).getAllMemos((err,rows)=>{result={err,rows};});assert.equal(result.err,failure);assert.equal(result.rows,null);
});
