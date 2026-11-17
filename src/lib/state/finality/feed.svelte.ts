import { HIDDEN_CLOSE_MS, backoffDelay, feedUrl, type FinalityConnection } from './connection';
import { emptyState, reduce, type FinalityState } from './state';
import type { Message } from './v1';

export class FinalityFeed {
	state = $state.raw<FinalityState>(emptyState());
	connection = $state<FinalityConnection>('connecting');
	now = $state(Date.now());

	private readonly base: string;
	private readonly network: string;
	private socket: WebSocket | null = null;
	private pending: FinalityState | null = null;
	private resuming = false;
	private attempt = 0;
	private running = false;
	private suspended = false;
	private retryTimer: ReturnType<typeof setTimeout> | undefined;
	private hiddenTimer: ReturnType<typeof setTimeout> | undefined;
	private clock: ReturnType<typeof setInterval> | undefined;
	private onVisibility = () => {
		if (document.hidden) {
			this.clearHiddenTimer();
			this.hiddenTimer = setTimeout(() => this.suspend(), HIDDEN_CLOSE_MS);
		} else {
			this.clearHiddenTimer();
			if (this.suspended) {
				this.suspended = false;
				this.attempt = 0;
				this.connect();
			}
		}
	};

	constructor(base: string, network: string) {
		this.base = base;
		this.network = network;
	}

	start() {
		if (this.running) return;
		this.running = true;
		document.addEventListener('visibilitychange', this.onVisibility);
		this.clock = setInterval(() => (this.now = Date.now()), 1000);
		this.connect();
	}

	stop() {
		this.running = false;
		this.suspended = false;
		document.removeEventListener('visibilitychange', this.onVisibility);
		clearInterval(this.clock);
		this.clearHiddenTimer();
		clearTimeout(this.retryTimer);
		this.closeSocket();
	}

	private connect() {
		clearTimeout(this.retryTimer);
		this.closeSocket();
		if (!this.running) return;
		const from = this.state.ready ? this.state.lastBlockNum : null;
		this.resuming = from !== null;
		this.pending = emptyState();
		const socket = new WebSocket(feedUrl(this.base, this.network, from));
		this.socket = socket;
		socket.onopen = () => {
			if (this.socket === socket) this.connection = 'open';
		};
		socket.onmessage = (event) => {
			if (this.socket === socket) this.receive(event.data);
		};
		socket.onerror = () => socket.close();
		socket.onclose = () => {
			if (this.socket === socket) this.closed();
		};
	}

	private receive(data: unknown) {
		let message: Message;
		try {
			message = JSON.parse(String(data));
		} catch (error) {
			console.error('finality feed: unparseable message', error);
			return;
		}
		if (!message || typeof message.type !== 'string') return;
		if (!this.pending) {
			this.state = reduce(this.state, message);
			return;
		}
		this.pending = reduce(this.pending, message);
		if (this.resuming) {
			this.state = reduce(this.state, message);
			if (message.type === 'block' && !this.pending.schedules.has(message.schedule_version)) {
				this.pending = null;
				this.attempt = 0;
				return;
			}
		}
		if (message.type === 'snapshot_end') {
			this.state = this.pending;
			this.pending = null;
			this.attempt = 0;
		}
	}

	private closed() {
		this.socket = null;
		this.pending = null;
		if (!this.running || this.suspended) return;
		this.connection = 'reconnecting';
		this.retryTimer = setTimeout(() => this.connect(), backoffDelay(this.attempt));
		this.attempt++;
	}

	private suspend() {
		this.hiddenTimer = undefined;
		if (!this.running) return;
		this.suspended = true;
		clearTimeout(this.retryTimer);
		this.closeSocket();
		this.connection = 'reconnecting';
	}

	private closeSocket() {
		const socket = this.socket;
		this.socket = null;
		if (!socket) return;
		socket.onopen = null;
		socket.onmessage = null;
		socket.onerror = null;
		socket.onclose = null;
		socket.close();
	}

	private clearHiddenTimer() {
		clearTimeout(this.hiddenTimer);
		this.hiddenTimer = undefined;
	}
}
