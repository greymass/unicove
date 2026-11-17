import { describe, expect, test } from 'bun:test';
import { missedSlots, slotOf, slotOwner } from './schedule';
import { block, schedule } from './testdata';

const jungle4 = [
	'alohaeostest',
	'aus1genereos',
	'detroitdhole',
	'eosaiagentbp',
	'eosamsterdam',
	'eosarabianet',
	'eosindiatest',
	'eosnationftw',
	'eosphereiobp',
	'eosriobrazil',
	'eoswuhan42bp',
	'gorillapower',
	'iamrobot1254',
	'iliketurtles',
	'ivote4eosusa',
	'jumpingfrogs',
	'lioninjungle',
	'ohtigertiger',
	'panshieosbp1',
	'thebluewhale',
	'vawalletest1'
];

describe('slot owner', () => {
	test('matches a Jungle 4 head block', () => {
		const slot = slotOf(Date.UTC(2026, 10, 17, 21, 26, 36));
		expect(slotOwner(slot, jungle4)).toBe('ohtigertiger');
	});

	test('each producer holds 12 slots in turn', () => {
		const producers = ['a', 'b', 'c'];
		const base = 36 * 1000;
		expect(slotOwner(base, producers)).toBe('a');
		expect(slotOwner(base + 11, producers)).toBe('a');
		expect(slotOwner(base + 12, producers)).toBe('b');
		expect(slotOwner(base + 35, producers)).toBe('c');
		expect(slotOwner(base + 36, producers)).toBe('a');
	});

	test('empty schedule has no owner', () => {
		expect(slotOwner(10, [])).toBeNull();
	});
});

describe('missedSlots', () => {
	test('attributes skipped slots to their owners across a round boundary', () => {
		const producers = ['a', 'b', 'c'];
		const schedules = new Map([[1, schedule(producers)]]);
		const firstSlot = 36 * 1000 + 10;
		const at = (slot: number) => slot * 500 + 946_684_800_000;
		const blocks = [
			block(100, { timestamp: at(firstSlot), producer: 'a' }),
			block(101, { timestamp: at(firstSlot + 4), producer: 'b' })
		];
		const missed = missedSlots(blocks, schedules);
		expect(missed.map((slot) => slot.slot)).toEqual([firstSlot + 1, firstSlot + 2, firstSlot + 3]);
		expect(missed.map((slot) => slot.owner)).toEqual(['a', 'b', 'b']);
		expect(missed.every((slot) => slot.before === 101)).toBe(true);
	});

	test('skips gaps in block numbers', () => {
		const schedules = new Map([[1, schedule(['a'])]]);
		const blocks = [block(100), block(105, { timestamp: block(100).timestamp + 5000 })];
		expect(missedSlots(blocks, schedules)).toEqual([]);
	});

	test('consecutive blocks one slot apart miss nothing', () => {
		const schedules = new Map([[1, schedule(['a'])]]);
		expect(missedSlots([block(100), block(101)], schedules)).toEqual([]);
	});
});
