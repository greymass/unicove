import { describe, expect, test } from 'bun:test';
import { truncateCenter } from './strings';

describe('truncateCenter', () => {
	test('truncates string at center', () => {
		expect(truncateCenter('05d453ba5a5cfc35426f5c71f1bbdbaab96321f3e66d230d4067aeea609793e3')).toBe(
			'05d45..793e3'
		);
	});

	test('truncates string to given length', () => {
		expect(
			truncateCenter('05d453ba5a5cfc35426f5c71f1bbdbaab96321f3e66d230d4067aeea609793e3', 8)
		).toBe('05d..3e3');
	});

	test("doesn't truncate if smaller than given length", () => {
		expect(truncateCenter('05d453ba5a5c')).toBe('05d453ba5a5c');
	});

	test('handle zero length', () => {
		expect(truncateCenter('')).toBe('');
	});
});
