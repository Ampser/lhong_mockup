import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,within} from '@testing-library/react';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import App from '../src/App';
import {points} from '../src/data/points';
import {mapReview} from '../src/data/map-review';
import snapshot from '../src/data/official-snapshot.json';
const key='kk-prototype-plan-v2-official';
function open(page:string){history.replaceState(null,'',`/#/${page}`);return render(<App/>)}
describe.each([390,1366])('DOM flow with window width %ipx (no layout engine)',width=>{
 function mount(page='home'){Object.defineProperty(window,'innerWidth',{configurable:true,value:width});return open(page)}
 it('renders official photos, working entry action and skip link without changing page',()=>{
  mount();expect(screen.getByRole('img',{name:/ช้างและนักท่องเที่ยว/}).getAttribute('src')).toContain('elephant.jpg');
  fireEvent.click(screen.getByRole('button',{name:/เริ่มวางแผนเที่ยว/}));
  fireEvent.click(screen.getByRole('link',{name:'ข้ามไปเนื้อหา'}));
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('อยากเที่ยวแบบไหน?');expect(document.activeElement?.id).toBe('main');
 });
 it('selects needs, filters interests, adds and removes a point, and reaches plan',()=>{
  mount('preferences');const need=screen.getByRole('button',{name:/มีผู้ใช้รถเข็น/});fireEvent.click(need);expect(need.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button',{name:/เลือกจุดที่อยากไป/}));fireEvent.click(screen.getByRole('button',{name:'การแสดง'}));
  expect(screen.getByRole('heading',{name:'ส่วนแสดงพาเหรด เพนกวิน'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'เพิ่มในแผน'}));fireEvent.click(screen.getByRole('button',{name:'อยู่ในแผนแล้ว'}));
  fireEvent.click(screen.getByRole('button',{name:/ดูแผนของฉัน/}));expect(screen.getByText('มีผู้ใช้รถเข็น')).toBeTruthy();expect(screen.getByText(/ลำดับแผนใช้ทดลองจัดเที่ยว/)).toBeTruthy();
 });
 it('reorders, removes, saves and restores a plan across a fresh render',()=>{
  const view=mount('plan');fireEvent.click(screen.getByRole('button',{name:'เลื่อนลง ศูนย์การเรียนรู้ช้าง'}));fireEvent.click(screen.getByRole('button',{name:'ลบ ฮิปโปโปเตมัส'}));fireEvent.click(screen.getByRole('button',{name:'บันทึกแผนในอุปกรณ์'}));
  expect(JSON.parse(localStorage.getItem(key)!).ids).toEqual(['official-38','official-54']);view.unmount();
  mount();fireEvent.click(screen.getByRole('button',{name:'แผนของฉัน'}));expect(screen.getByText('2 จุดในแผน')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'ลบแผนที่บันทึก'}));expect(localStorage.getItem(key)).toBeNull();
 });
 it('shows official map only, searches and filters actual points, with no guessed pin',()=>{
  const {container}=mount('map');expect(container.querySelector('[data-map-version="official-2026-10-31"]')).toBeTruthy();expect(container.querySelector('.map-sheet img')?.getAttribute('src')).toContain('zoo-map.webp');expect(container.querySelectorAll('.official-pin').length).toBe(9);expect(container.querySelector('.map-canvas')).toBeNull();expect(container.querySelector('polyline')).toBeNull();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'ประชาสัมพันธ์'}});expect(container.querySelectorAll('.official-pin').length).toBe(1);expect(screen.getByText('พบ 1 จุด')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'ล้างการค้นหา'}));fireEvent.change(screen.getByLabelText('หมวดจากแผนที่ทางการ'),{target:{value:'5'}});expect(screen.getByText(/พบ \d+ จุด/)).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'ไม่มีชื่อดังกล่าว'}});expect(screen.getByText('ไม่พบจุดที่ตรงกับคำค้น')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'ดูทุกจุด'}));
  const item=screen.getByRole('button',{name:/อาคารจำหน่ายบัตร.*ตำแหน่งรอยืนยัน/});fireEvent.click(item);expect(within(screen.getByRole('dialog')).getByText('ตำแหน่งรอยืนยัน · ยังไม่วางหมุด')).toBeTruthy();
  fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).toBeNull();
 });
 it('generates a real QR data URL and opens the selected point',async()=>{
  mount('qr');fireEvent.change(screen.getByLabelText('รายการจากแผนที่ทางการ'),{target:{value:'official-59'}});
  await waitFor(()=>expect(screen.getByRole('img',{name:/QR เปิดรายละเอียด ส่วนแสดงพาเหรด/}).getAttribute('src')).toMatch(/^data:image\/png;base64,/));
  fireEvent.click(screen.getByRole('button',{name:/เปิดรายละเอียดจุด/}));expect(location.hash).toBe('#/point/official-59');expect(within(screen.getByRole('dialog')).getByRole('heading',{name:'ส่วนแสดงพาเหรด เพนกวิน'})).toBeTruthy();
 });
 it('opens QR deep links, zooms, and adds an unlocated point without inventing a pin',()=>{
  mount('point/official-1');const dialog=screen.getByRole('dialog');fireEvent.click(within(dialog).getByRole('button',{name:'เพิ่มในแผน'}));fireEvent.click(within(dialog).getByRole('button',{name:'ปิดรายละเอียด'}));
  fireEvent.click(screen.getByRole('button',{name:'ซูมเข้า'}));expect(screen.getByRole('button',{name:/คืนขนาดแผนที่/}).textContent).toContain('150%');
  fireEvent.click(screen.getByRole('button',{name:'คืนขนาดแผนที่'}));expect(screen.getByRole('button',{name:/คืนขนาดแผนที่/}).textContent).toContain('100%');
  expect(screen.queryByRole('button',{name:'ดู อาคารจำหน่ายบัตร บนแผนที่'})).toBeNull();
 });
 it('requests GPS only on click and does not persist received coordinates',()=>{
  mount('map');const gps=vi.mocked(navigator.geolocation.getCurrentPosition);expect(gps).not.toHaveBeenCalled();
  gps.mockImplementation(success=>success({coords:{latitude:13.1,longitude:101.2}} as GeolocationPosition));fireEvent.click(screen.getByRole('button',{name:'ทดลอง GPS'}));expect(gps).toHaveBeenCalledTimes(1);expect(screen.getByRole('status').textContent).toContain('ยังเชื่อม GPS');expect(localStorage.length).toBe(0);
 });
 it.each([1,2,3])('handles GPS error %i and lets user retry',code=>{
  mount('map');vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((_success,error)=>error?.({code} as GeolocationPositionError));fireEvent.click(screen.getByRole('button',{name:'ทดลอง GPS'}));expect(screen.getByRole('button',{name:'ทดลอง GPS'}).hasAttribute('disabled')).toBe(false);expect(screen.getByRole('status').textContent).toMatch(code===1?/ไม่ได้อนุญาต/:/ยังรับตำแหน่งไม่ได้/);
 });
 it('ignores invalid saved data and obsolete mock point links',()=>{
  localStorage.setItem(key,JSON.stringify({ids:['demo-giraffe'],preferences:[],savedAt:'broken'}));mount('point/demo-giraffe');expect(screen.getByText(/ไม่พบจุดนี้ในข้อมูลฉบับปัจจุบัน/)).toBeTruthy();expect(screen.queryByRole('dialog')).toBeNull();
 });
});
describe('official data and local image files',()=>{
 it('keeps operational facts pending and restricts pins to reviewed image coordinates',()=>{
  expect(points).toHaveLength(99);expect(points.filter(p=>p.imagePosition)).toHaveLength(9);
  for(const p of points){expect(p.wheelchair).toBe('unknown');expect([p.routeStatus,p.scheduleStatus,p.queueStatus]).toEqual(['pending','pending','pending']);if(p.imagePosition)expect(mapReview.positions.find(r=>r.id===p.sourcePointId)).toMatchObject(p.imagePosition);else expect(p.locationStatus).toBe('pending')}
  expect(snapshot.positions.every(p=>p.lat===null&&p.lng===null)).toBe(true);
 });
 it('checks all eight asset files, manifest sizes, source domains, and reviewed map hash',()=>{
  expect(snapshot.assets).toHaveLength(8);
  for(const asset of snapshot.assets){expect(existsSync(asset.file)).toBe(true);const file=readFileSync(asset.file);expect(file.byteLength).toBe(asset.bytes);expect(new URL(asset.sourceUrl).hostname).toBe('api.zoothailand.or.th');expect(file.subarray(0,2).toString('hex')==='ffd8'||file.subarray(0,4).toString()==='RIFF').toBe(true)}
  const hash=createHash('sha256').update(readFileSync('src/assets/official/zoo-map.webp')).digest('hex');expect(hash).toBe(mapReview.imageSha256);expect(snapshot.mapImageSha256).toBe(hash);
 });
});
