self.onmessage = (e) => {
	const duration = e.data?.ms ?? 3000;
	self.postMessage({ status: 'starting', duration });

	const start = performance.now();
	const end = start + duration;

	while (performance.now() < end) {
		Math.sqrt(Math.random() * 1e6); // Simulated load
	}

	self.postMessage({ status: 'done' });
};
