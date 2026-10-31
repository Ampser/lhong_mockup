import {afterEach,beforeEach,vi} from 'vitest';
import {cleanup} from '@testing-library/react';
beforeEach(()=>{
 localStorage.clear();history.replaceState(null,'','/#/home');
 Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn(query=>({matches:query.includes('prefers-reduced-motion')?false:window.innerWidth<=760,media:query,onchange:null,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn(),dispatchEvent:vi.fn()}))});
 window.scrollTo=vi.fn();Element.prototype.scrollIntoView=vi.fn();
 Object.defineProperty(navigator,'geolocation',{configurable:true,value:{getCurrentPosition:vi.fn()}});
});
afterEach(()=>{cleanup();vi.restoreAllMocks()});
