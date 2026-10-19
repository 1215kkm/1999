export const categories = ['상의', '하의', '아우터', '신발', '가방', '액세서리'] as const;
export const seasons = ['봄', '여름', '가을', '겨울'] as const;
export const statuses = {available:'사용 가능', laundry:'세탁 중', lent:'대여 중', archived:'보관 중'};
export type Item = {id:string; name:string; category:string; color:string; seasons:string[]; locationId:string; status:keyof typeof statuses; ownership:'owned'|'wishlist'; imageId?:string; note:string};
export type Location = {id:string; name:string};
export type Outfit = {id:string; name:string; itemIds:string[]; fixedId?:string; createdAt:string; wornDates:string[]};
export type Data = {items:Item[]; locations:Location[]; outfits:Outfit[]};
