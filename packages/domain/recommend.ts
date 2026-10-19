import type {Item} from './model.ts';
export function recommend(items:Item[], fixedId:string|undefined, season:string, offset=0): string[] {
  const available = items.filter(i=>i.ownership==='owned' && i.status==='available');
  const fixed=available.find(i=>i.id===fixedId);
  if(fixedId && !fixed) throw new Error('고정한 옷이 현재 사용 가능한 소유 아이템인지 확인해 주세요.');
  const result:Item[]=fixed?[fixed]:[];
  for(const category of ['상의','하의','아우터','신발','가방','액세서리']) {
    if(fixed?.category===category) continue;
    const pool=available.filter(i=>i.category===category && (!season || i.seasons.includes(season)));
    if(pool.length) result.push(pool[offset%pool.length]);
  }
  return result.map(i=>i.id);
}
