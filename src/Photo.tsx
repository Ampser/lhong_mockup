import {useState} from 'react';
import {Camera} from 'lucide-react';
export default function Photo({src,alt,className='',eager=false}:{src?:string;alt:string;className?:string;eager?:boolean}){
 const [failed,setFailed]=useState(false);
 if(!src||failed)return <div className={`photo-placeholder ${className}`}><Camera size={30}/><span>ยังไม่มีภาพจากแหล่งทางการ</span><small>{alt}</small></div>;
 return <img className={`photo ${className}`} src={src} alt={alt} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>;
}
