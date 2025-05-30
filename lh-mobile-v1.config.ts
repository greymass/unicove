// This is the default that always gets used unless a different config file is specified
export default {
	// Maximum acceptable performance budget score for CI checks
	ci: {
		budget: 10
	},

	// // Increase accuracy by only allowing 1 page to be scanned at a time
	// puppeteerClusterOptions: {
	//   // only run 1 worker at a time
	//   maxConcurrency: 1
	// },

	// ////////////////////////////////////////////////////////////////////////////
	// // Emulate desktop in scan:
	// // Throttling "provided by environment" in lighthouse results.
	// // Throttle connection with sitespeed.io/throttle npm module on cmd line:
	// // "throttle --up 10240 --down 10240 -rtt 40"
	// // (APPROX. the same as PageSpeed Insights desktop settings)
	// ////////////////////////////////////////////////////////////////////////////
	// scanner: {
	//   device: 'desktop',
	//   throttle: false,
	//   //dynamicSampling: false, // or any number, default is 5

	//   // exclude specific routes
	//   // exclude: [
	//     //   '/.*?pdf',
	//     //   '.*/amp',
	//     //   'en-*',
	//     // ],

	//     // run lighthouse for each URL 3 times
	//     // samples: 3,
	//   },

	////////////////////////////////////////////////////////////////////////////
	// Emulate mobile in scan:
	// (throttling same as PageSpeed simulated Moto 4G Power Slow 4G)
	////////////////////////////////////////////////////////////////////////////
	scanner: {
		device: 'mobile'
		// throttle: true

		//   // exclude specific routes
		//   // exclude: [
		//     //   '/.*?pdf',
		//     //   '.*/amp',
		//     //   'en-*',
		//     // ],

		//     // run lighthouse for each URL 3 times
		//     // samples: 3,
	}

	////////////////////////////////////////////////////////////////////////////
	// Emulate mobile with devtools settings:
	// (throttling same as Chrome devtools plugin?)
	////////////////////////////////////////////////////////////////////////////
	// scanner: {
	//   device: 'mobile',
	//   throttle: true,

	//   // exclude specific routes
	//   // exclude: [
	//     //   '/.*?pdf',
	//     //   '.*/amp',
	//     //   'en-*',
	//     // ],

	//     // run lighthouse for each URL 3 times
	//     // samples: 3,
	//   },

	// lighthouseOptions: {
	//   throttlingMethod: 'devtools',
	// },

	// debug: true,
};
