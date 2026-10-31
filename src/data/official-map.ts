import snapshot from './official-snapshot.json';
import mapImage from '../assets/official/zoo-map.webp';
export const officialMapSource={
 sourceUrl:snapshot.sourceUrl,checkedOn:snapshot.checkedOn,image:mapImage,
 status:'image_and_selected_positions_visually_inspected',
 method:'ตรวจเว็บไซต์ทางการและภาพแผนที่ที่ดาวน์โหลดด้วยสายตา เทียบเฉพาะจุดที่แสดงหมุด ไม่รับรองพิกัด GPS หรือเส้นทางภาคสนาม',
 rights:{status:'user_confirmed_zoo_permission_for_prototype_and_public_repository',confirmedOn:'2026-11-01',imagesCopiedOrEmbedded:true,note:'ผู้ใช้ยืนยันว่าได้รับอนุญาตครอบคลุมภาพทั้ง 7 ภาพและแผนที่ใน prototype และ GitHub repository public รวมถึงภาพที่มีลายน้ำ ไม่ใช่ใบอนุญาตเปิดให้บุคคลทั่วไปนำไปใช้ต่อ ดู ASSET_RIGHTS.md'},
 apiUrls:{map:snapshot.mapApiUrl,categories:snapshot.categoryApiUrl,positions:snapshot.positionApiUrl},
 observations:{positionCount:snapshot.positions.length,positionsWithLatitudeAndLongitude:snapshot.positions.filter(p=>p.lat!==null&&p.lng!==null).length},
};
export const assetSources=snapshot.assets;
