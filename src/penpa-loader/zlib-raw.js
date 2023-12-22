import zlibRawInflate from './rawinflate.min.js?raw'
const RawDeflate = Function(`${zlibRawDeflate}; return Zlib.RawDeflate;`)()

import zlibRawDeflate from './rawdeflate.min.js?raw'
const RawInflate = Function(`${zlibRawInflate}; return Zlib.RawInflate;`)()

export const Zlib = {
    RawDeflate, 
    RawInflate
}