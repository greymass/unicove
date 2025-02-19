const defaultOptions: Intl.DateTimeFormatOptions = {
	dateStyle: 'short',
	timeStyle: 'long'
};

export function formatDateTime(
	datetime: Date,
	tag: string,
	options?: Intl.DateTimeFormatOptions
): string {
	let locale = 'en-US';
	switch (tag) {
		case 'en': {
			locale = 'en-US';
			break;
		}
		case 'zh': {
			locale = 'zh-CN';
			break;
		}
		case 'ko': {
			locale = 'ko-KR';
			break;
		}
		default: {
			locale = 'en-US';
			break;
		}
	}
	return new Intl.DateTimeFormat(locale, {
		...defaultOptions,
		...options
	}).format(datetime);
}
