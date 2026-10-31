import {useState} from 'react';
import {Plus,Minus,RotateCcw,MapPin,ExternalLink} from 'lucide-react';
import {officialMapSource} from './data/official-map';
import {points} from './data/points';
import type {Point} from './data/points';
export default function ZooMap({selected,onPoint,compact=false,visible=points}:{selected:Point[];onPoint:(p:Point)=>void;compact?:boolean;visible?:Point[]}){
 const [zoom,setZoom]=useState(1);
 return <div className={`official-map ${compact?'compact-map':''}`} data-map-version={`official-${officialMapSource.checkedOn}`}>
 {!compact&&<div className="map-controls"><span>แผนที่จากสวนสัตว์</span><div><button aria-label="ซูมออก" disabled={zoom<=1} onClick={()=>setZoom(v=>Math.max(1,v-.5))}><Minus size={17}/></button><button aria-label="คืนขนาดแผนที่" onClick={()=>setZoom(1)}><RotateCcw size={14}/>{Math.round(zoom*100)}%</button><button aria-label="ซูมเข้า" disabled={zoom>=3} onClick={()=>setZoom(v=>Math.min(3,v+.5))}><Plus size={17}/></button></div></div>}
 <div className="map-scroll" tabIndex={compact?-1:0} aria-label="แผนที่สวนสัตว์ เลื่อนดูได้เมื่อซูม"><div className="map-sheet" style={{width:`${zoom*100}%`}}>
 <img src={officialMapSource.image} width="1440" height="960" alt="แผนที่สวนสัตว์เปิดเขาเขียวจากเว็บไซต์ทางการ มีพื้นที่สีเขียว พื้นที่สีชมพู จุดชมสัตว์และบริการ"/>
 {!compact&&visible.filter(p=>p.imagePosition!==null).map(p=><button key={p.id} className={`official-pin ${selected.some(s=>s.id===p.id)?'planned':''}`} style={{left:`${p.imagePosition!.x}%`,top:`${p.imagePosition!.y}%`}} onClick={()=>onPoint(p)} aria-label={`ดู ${p.name} บนแผนที่`} title={p.name}><MapPin size={18}/><span>{p.name}</span></button>)}
 </div></div>
 {!compact&&<div className="map-caption"><p>หมุดอ้างอิงตำแหน่งบนภาพที่ตรวจเทียบแล้ว ไม่ใช่พิกัด GPS · จุดอื่นแสดงในรายการ “ตำแหน่งรอยืนยัน”</p><a href={officialMapSource.sourceUrl} target="_blank" rel="noopener noreferrer">ต้นฉบับทางการ <ExternalLink size={13}/></a><p>รอบเวลาและรายละเอียดที่พิมพ์อยู่ในภาพเป็นข้อมูลตามฉบับแผนที่ โปรดตรวจสอบกับสวนสัตว์ก่อนเดินทาง</p></div>}
 </div>;
}
