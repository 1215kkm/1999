import type {Data,Item} from '../domain/model';
const KEY='wardrobe.local.v1';
export const seed = ():Data => ({locations:[{id:'closet',name:'안방 옷장'},{id:'drawer',name:'서랍장'},{id:'shoe',name:'신발장'}], outfits:[], items:[
  ['스트라이프 티셔츠','상의','#50574f'],['아이보리 니트','상의','#e4daca'],['블루 셔츠','상의','#91b4d2'],['네이비 재킷','아우터','#293748'],['베이지 재킷','아우터','#c5b49d'],['화이트 티셔츠','상의','#efede5'],['네이비 슬랙스','하의','#303b4d'],['플리츠 스커트','하의','#c6b79d'],['데님 재킷','아우터','#7594ae'],['올리브 가디건','상의','#7e865a'],['크림 셔츠','상의','#ded6bc'],['브라운 니트','상의','#816350'],['연청 데님','하의','#92b3c4'],['블랙 스커트','하의','#353c3b'],['화이트 스니커즈','신발','#e7e3d7'],['블랙 로퍼','신발','#333735'],['브라운 토트백','가방','#956b4b'],['블랙 숄더백','가방','#343a35'],['베이지 캡','액세서리','#c4b89e'],['골드 목걸이','액세서리','#b69858'],['트렌치 코트','아우터','#bfae90'],['베이지 팬츠','하의','#c5bca9'],['그레이 니트','상의','#a8aaa5'],['실버 시계','액세서리','#9aabaa']
].map(([name,category,color],n):Item=>({id:`sample-${n}`,name,category,color,seasons:n%3===0?['여름']:['봄','가을','겨울'],locationId:category==='신발'?'shoe':n%4===0?'drawer':'closet',status:n===8?'laundry':n===15?'lent':'available',ownership:'owned',note:'직접 제작한 샘플 일러스트입니다.'}))});
export interface Repository {load():Data; save(data:Data):void; getImage(id:string):Promise<Blob|undefined>; putImage(id:string,file:Blob):Promise<void>; deleteImage(id:string):Promise<void>; clearImages():Promise<void>}
const database = () => new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('wardrobe-images',1);r.onupgradeneeded=()=>r.result.createObjectStore('images');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
async function imageOperation<T>(mode:IDBTransactionMode, run:(s:IDBObjectStore)=>IDBRequest):Promise<T>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('images',mode);const request=run(tx.objectStore('images'));tx.oncomplete=()=>{resolve(request.result);db.close();};tx.onerror=()=>{reject(tx.error);db.close();};});}
export const repository:Repository={
 load(){const raw=localStorage.getItem(KEY);if(!raw)return seed();const data=JSON.parse(raw);if(!Array.isArray(data.items)||!Array.isArray(data.locations)||!Array.isArray(data.outfits))throw Error('로컬 데이터 형식을 확인해 주세요.');return data;},
 save(data){localStorage.setItem(KEY,JSON.stringify(data));},
 getImage:id=>imageOperation('readonly',s=>s.get(id)),putImage:(id,file)=>imageOperation('readwrite',s=>s.put(file,id)),deleteImage:id=>imageOperation('readwrite',s=>s.delete(id)),clearImages:()=>imageOperation('readwrite',s=>s.clear())
};
