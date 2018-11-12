module.exports = {
	entry: './editor.js',
	mode: 'production',
	output: {
		path: `${__dirname}/theme/editor`,
		library: 'init',
		libraryTarget: 'umd',
		publicPath: '/theme/editor/',
		filename: 'editor.js',
	},
}