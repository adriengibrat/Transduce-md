module.exports = {
	entry: './editor.js',
	mode: 'development',
	output: {
		path: `${__dirname}/theme/editor`,
		library: 'init',
		libraryTarget: 'umd',
		publicPath: '/theme/editor/',
		filename: 'editor.js',
	},
}