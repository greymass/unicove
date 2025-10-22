 // @ts-nocheck
            import * as _w_c_server_0_ from './en.compiled.server.js'
import * as _w_c_server_1_ from './ko.compiled.server.js'
import * as _w_c_server_2_ from './zh.compiled.server.js'
            const catalogs = {server: {en: _w_c_server_0_,ko: _w_c_server_1_,zh: _w_c_server_2_}}
            export const loadCatalog = (loadID, locale) => catalogs[loadID][locale]
            
            export const loadIDs = ['server']
            export const key = 'server'
        
            export const locales = ['en','ko','zh']
        