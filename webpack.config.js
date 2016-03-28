module.exports = {
	entry: "./examples/index.js",
	output: {
		path: './examples',
		filename: "index-compiled.js"
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: "babel",
			query: {
				presets: ['es2015']
			}
		}]
	},
	quiet: true,
	noInfo: false,
	stats: {
		assets: false,
		colors: true,
		version: false,
		hash: false,
		timings: false,
		chunks: false,
		chunkModules: false
	},
}