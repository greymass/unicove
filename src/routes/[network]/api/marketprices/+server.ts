import { json } from '@sveltejs/kit';
import { INFLUX_HOST, INFLUX_TOKEN } from '$env/static/private';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import { InfluxDB } from '@influxdata/influxdb-client';

if (!INFLUX_HOST || !INFLUX_TOKEN) {
	throw new Error('Timeseries data not configured');
}

const influxdb = new InfluxDB({ url: INFLUX_HOST, token: INFLUX_TOKEN });

export async function GET({ params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}
	const network = getNetwork(chain, fetch);
	if (!network.config.features.timeseries) {
		return json({ error: 'Timeseries not enabled for this chain' }, { status: 400 });
	}

	const ram = await getData('ram');

	return json(
		{
			ts: new Date(),
			marketprices: {
				ram
			}
		},
		{
			headers: getCacheHeaders(60)
		}
	);
}

export interface Marketprice {
	result: string;
	table: number;
	_start: string;
	_stop: string;
	_time: string;
	_value: number;
	_field: string;
	_measurement: string;
}

async function getData(measurement: 'cpu' | 'net' | 'ram', bucket = '15m', range = '30d') {
	const marketprice = influxdb.getQueryApi('unicove_eos');

	const query = `
    from(bucket: "marketprice-${bucket}")
    |> range(start: -${range})
    |> filter(fn: (r) => r._measurement == "${measurement}")
    `;

	const result = await marketprice.collectRows<Marketprice>(query);

	return result.map((row) => ({
		date: row._time,
		value: row._value
	}));
}
