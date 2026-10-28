// This is just the default loader.
// You can customize it however you want, it will not be overwritten once it exists and is not empty.

/// <reference types="wuchale/virtual" />

import { loadCatalog, loadIDs, key } from 'virtual:wuchale/proxy' // or proxy/sync
import { registerLoaders, defaultCollection } from 'wuchale/load-utils'

const catalogs = $state({})
const collection = defaultCollection(catalogs)
/** @type {Record<string, unknown>} */
const current = {}

// Skip same-catalog writes: every load() calls loadLocale, and rewriting the $state invalidates every translated string
export const get = registerLoaders(key, loadCatalog, loadIDs, {
	get: collection.get,
	set: (loadID, catalog) => {
		if (current[loadID] === catalog) return
		current[loadID] = catalog
		collection.set(loadID, catalog)
	}
})

export default get
