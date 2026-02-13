function storageKey(account: string): string {
	return `unicove_bidname_tracked_${account}`;
}

export function getTrackedNames(account: string): string[] {
	if (typeof localStorage === 'undefined') return [];
	const stored = localStorage.getItem(storageKey(account));
	return stored ? JSON.parse(stored) : [];
}

export function addTrackedName(account: string, name: string) {
	const names = getTrackedNames(account);
	if (!names.includes(name)) {
		names.push(name);
		localStorage.setItem(storageKey(account), JSON.stringify(names));
	}
}

export function removeTrackedName(account: string, name: string) {
	const names = getTrackedNames(account).filter((n) => n !== name);
	localStorage.setItem(storageKey(account), JSON.stringify(names));
}
