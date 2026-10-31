import snapshot from './official-snapshot.json';
import {mapReview} from './map-review';
import giraffe from '../assets/official/giraffe.webp';
import elephant from '../assets/official/elephant.jpg';
import hippo from '../assets/official/hippo.webp';
import penguin from '../assets/official/penguin.jpg';
import aviary from '../assets/official/aviary.jpg';
import capybara from '../assets/official/capybara.jpg';
import pygmyHippo from '../assets/official/pygmy-hippo.jpg';
export const sampleLabel = 'ข้อมูลตัวอย่าง—รอยืนยันกับสวนสัตว์';
export const sourceUrl = snapshot.sourceUrl;
export const checkedOn = snapshot.checkedOn;
export type Point = {
 id:string;sourcePointId:number;name:string;categoryId:number;categoryName:string;
 kind:'animal'|'activity'|'show'|'service';subtitle:string;photo?:string;
 status:'observed_in_official_source';sourceUrl:string;evidenceUrl:string;checkedOn:string;
 locationStatus:'map_visual_checked'|'pending';imagePosition:{x:number;y:number}|null;
 wheelchair:'unknown';routeStatus:'pending';scheduleStatus:'pending';queueStatus:'pending';description:string;
};
// เทียบชื่อ สัญลักษณ์ และบริเวณบนภาพด้วยสายตา ค่าเป็นเปอร์เซ็นต์บนภาพ ไม่ใช่ GPS
const reviewedImage = snapshot.map.image.path === mapReview.imagePath && snapshot.mapImageSha256 === mapReview.imageSha256;
const visuallyChecked = new Set(reviewedImage ? mapReview.positions.filter(review => {
 const current = snapshot.positions.find(p => p.id === review.id);
 return current?.x === review.x && current?.y === review.y;
}).map(p => p.id) : []);
const photos:Record<number,string>={10:pygmyHippo,38:giraffe,41:hippo,45:capybara,54:elephant,59:penguin,60:aviary};
const subtitles:Record<number,string>={10:'ฮิปโปตัวเล็กที่หลายคนอยากแวะชม',38:'แวะชมยีราฟระหว่างวัน',41:'อีกหนึ่งจุดที่ใส่ไว้ในแผนได้',45:'เก็บคาปิบาราไว้ในลิสต์ของคุณ',54:'แวะเรียนรู้เรื่องช้างด้วยกัน',59:'เพิ่มเพนกวินไว้ในวันเที่ยว',60:'เผื่อเวลาให้โลกของนก'};
export const categories=snapshot.categories.map(c=>({id:c.id,name:c.name,sourceUrl,checkedOn,status:'observed_in_official_source' as const}));
export const points:Point[]=snapshot.positions.map(p=>({
 id:`official-${p.id}`,sourcePointId:p.id,name:p.name,categoryId:p.mapCategoryId,
 categoryName:categories.find(c=>c.id===p.mapCategoryId)?.name??'หมวดรอยืนยัน',
 kind:p.id===59?'show':p.id===54||p.id===60?'activity':photos[p.id]?'animal':'service',
 subtitle:subtitles[p.id]??'ข้อมูลรายการจากแผนที่ทางการ',photo:photos[p.id],
 status:'observed_in_official_source',sourceUrl,evidenceUrl:snapshot.positionApiUrl,checkedOn,
 locationStatus:visuallyChecked.has(p.id)?'map_visual_checked':'pending',
 imagePosition:visuallyChecked.has(p.id)?{x:p.x,y:p.y}:null,
 wheelchair:'unknown',routeStatus:'pending',scheduleStatus:'pending',queueStatus:'pending',
 description:'พบรายการนี้ในหน้าแผนที่ทางการของสวนสัตว์ ข้อมูลการเปิดบริการ เส้นทาง ระยะทาง รอบกิจกรรม คิว และการเข้าถึงสำหรับรถเข็นยังรอยืนยันก่อนใช้งานจริง',
}));
export const featured=[54,38,41,59,45,60,10].map(id=>points.find(p=>p.sourcePointId===id)!);
export const preferenceOptions=[
 {id:'less',title:'อยากเดินน้อย',detail:'จัดแผนไม่แน่น และเว้นเวลาแวะพัก',icon:'foot'},
 {id:'senior',title:'มากับผู้สูงอายุ',detail:'เผื่อจังหวะพักและปรับแผนได้สะดวก',icon:'rest'},
 {id:'wheelchair',title:'มีผู้ใช้รถเข็น',detail:'ตรวจข้อมูลการเข้าถึงก่อนออกเดินทาง',icon:'access'},
 {id:'kids',title:'มากับเด็ก',detail:'เลือกจุดที่ทุกคนอยากไปด้วยกัน',icon:'family'},
];
