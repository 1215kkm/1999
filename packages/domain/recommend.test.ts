import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommend} from './recommend.ts';
import type {Item} from './model.ts';
const item=(id:string,category:string,status:Item['status']='available',ownership:Item['ownership']='owned'):Item=>({id,name:id,category,status,ownership,color:'#fff',seasons:['봄'],locationId:'',note:''});
test('모든 재추천에서 고정 아이템을 유지하고 사용할 수 없는 옷을 제외한다',()=>{const items=[item('top','상의'),item('top2','상의'),item('pants','하의'),item('wash','신발','laundry'),item('loan','가방','lent'),item('archive','아우터','archived'),item('wish','액세서리','available','wishlist')];for(let n=0;n<10;n++){const ids=recommend(items,'top','봄',n);assert.ok(ids.includes('top'));assert.deepEqual(ids,['top','pants']);assert.ok(ids.every(id=>items.some(i=>i.id===id)));}});
test('없는 아이템 또는 사용할 수 없는 고정 아이템은 거부한다',()=>{assert.throws(()=>recommend([],'missing',''));assert.throws(()=>recommend([item('x','상의','laundry')],'x',''));});
test('빈 옷장은 빈 결과, 계절 필터는 고정 옷 외 후보에 적용한다',()=>{assert.deepEqual(recommend([],undefined,''),[]);assert.deepEqual(recommend([item('x','상의'),item('y','하의')],'x','겨울'),['x']);});
