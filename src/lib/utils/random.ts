export function generateRandomName(length = 12) {
	let name = '';
	const characters = 'abcdefghijklmnopqrstuvwxyz12345';

	for (let i = 0; i < length; i += 1) {
		name += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return name;
}
