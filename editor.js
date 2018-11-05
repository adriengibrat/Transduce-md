import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { loadWASM } from 'onigasm'

const onigasm = loadWASM('theme/editor/static/onigasm.wasm')

export async function iniEditor({ editor, languages }) {
	await onigasm // only load onigasm once
	const typescript = new Registry({
		getGrammarDefinition: async (scopeName) => {
			console.log('getGrammarDefinition', scopeName)
			return {
				format: 'json',
				content: await (await fetch('theme/editor/static/TypeScript.tmLanguage.json')).text(),
			}
		}
	})
	// const javascript = new Registry({
	// 	getGrammarDefinition: async (scopeName) => ({
	// 		format: 'json',
	// 		content: await (await fetch('theme/editor/static/JavaScript.tmLanguage.json')).text(),
	// 	})
	// })
	const grammars = new Map()
	grammars.set('typescript', 'source.ts')
	// grammars.set('javascript', 'source.ts')
	await wireTmGrammars({ languages }, typescript, grammars)
	editor.defineTheme('dimmed-monokai', {
		'base': 'vs-dark',
		'inherit': true,
		'rules': [
		  {
			'foreground': '9a9b99',
			'fontStyle': '\n        ',
			'token': 'comment'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'string'
		  },
		  {
			'foreground': 'd08442',
			'fontStyle': '\n    ',
			'token': 'string source'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'constant.numeric'
		  },
		  {
			'foreground': '408080',
			'fontStyle': '\n    ',
			'token': 'constant.language'
		  },
		  {
			'foreground': '8080ff',
			'background': '1e1e1e',
			'fontStyle': '\n    ',
			'token': 'constant.character'
		  },
		  {
			'foreground': '8080ff',
			'background': '1e1e1e',
			'fontStyle': '\n    ',
			'token': 'constant.other'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'keyword'
		  },
		  {
			'foreground': 'c7444a',
			'fontStyle': '\n    ',
			'token': 'support'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'storage'
		  },
		  {
			'foreground': '9b0000',
			'background': '1e1e1e',
			'fontStyle': '\n    ',
			'token': 'entity.name.class'
		  },
		  {
			'foreground': '9b0000',
			'background': '1e1e1e',
			'fontStyle': '\n    ',
			'token': 'entity.name.type.class'
		  },
		  {
			'foreground': '9b0000',
			'background': '1e1e1e',
			'fontStyle': '\n    ',
			'token': 'entity.name.type.module'
		  },
		  {
			'foreground': 'c7444a',
			'fontStyle': '\n    ',
			'token': 'entity.other.inherited-class'
		  },
		  {
			'foreground': 'ce6700',
			'fontStyle': '\n    ',
			'token': 'entity.name.function'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'variable.parameter'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'entity.name.tag'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'entity.other.attribute-name'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'support.function'
		  },
		  {
			'foreground': '676867',
			'fontStyle': '\n    ',
			'token': 'keyword'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'variable.other'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'variable.js'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'punctuation.separator.variable'
		  },
		  {
			'foreground': 'ff0080',
			'fontStyle': '\n    ',
			'token': 'constant.language'
		  },
		  {
			'foreground': '008200',
			'fontStyle': '\n    ',
			'token': 'punctuation.section.embedded -(source string source punctuation.section.embedded)'
		  },
		  {
			'foreground': '008200',
			'fontStyle': '\n    ',
			'token': 'meta.brace.erb.html'
		  },
		  {
			'foreground': 'ff0b00',
			'fontStyle': '\n    ',
			'token': 'invalid'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'variable.other.php'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'variable.other.normal'
		  },
		  {
			'foreground': '0080ff',
			'fontStyle': '\n    ',
			'token': 'meta.function-call'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'meta.function-call.object'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'variable.other.property'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'keyword.control'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'meta.tag'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'entity.name.tag'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'meta.doctype'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'meta.tag.sgml-declaration.doctype'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'meta.tag.sgml.doctype'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'meta.tag.inline source'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'text.html.php.source'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'meta.tag.other'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'entity.name.tag.style'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'entity.name.tag.script'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'meta.tag.block.script'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'source.js.embedded punctuation.definition.tag.html'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'source.css.embedded punctuation.definition.tag.html'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'entity.other.attribute-name'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'meta.tag punctuation.definition.string'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'meta.tag string -source -punctuation'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'text source text meta.tag string -punctuation'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'punctuation.section.embedded -(source string source punctuation.section.embedded)'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'meta.brace.erb.html'
		  },
		  {
			'foreground': '9aa83a',
			'token': 'meta.toc-list.id'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'string.quoted.double.html'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'punctuation.definition.string.begin.html'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'punctuation.definition.string.end.html'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'punctuation.definition.tag.html'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'punctuation.definition.tag.begin'
		  },
		  {
			'foreground': '6089b4',
			'fontStyle': '\n    ',
			'token': 'punctuation.definition.tag.end'
		  },
		  {
			'foreground': '9872a2',
			'fontStyle': '\n    ',
			'token': 'meta.selector.css entity.other.attribute-name.id'
		  },
		  {
			'foreground': '676867',
			'fontStyle': '\n    ',
			'token': 'support.type.property-name.css'
		  },
		  {
			'foreground': 'c7444a',
			'fontStyle': '\n    ',
			'token': 'meta.property-group support.constant.property-value.css'
		  },
		  {
			'foreground': 'c7444a',
			'fontStyle': '\n    ',
			'token': 'meta.property-value support.constant.property-value.css'
		  },
		  {
			'foreground': 'cc555a',
			'token': 'variable.language.js'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'meta.function-call.object.php'
		  },
		  {
			'foreground': '9aa83a',
			'token': 'punctuation.definition.string.end.php'
		  },
		  {
			'foreground': '9aa83a',
			'token': 'punctuation.definition.string.begin.php'
		  },
		  {
			'foreground': '676867',
			'token': 'source.php.embedded.line.html'
		  },
		  {
			'foreground': 'd08442',
			'fontStyle': '\n    ',
			'token': 'punctuation.section.embedded.begin.php'
		  },
		  {
			'foreground': 'd08442',
			'fontStyle': '\n    ',
			'token': 'punctuation.section.embedded.end.php'
		  },
		  {
			'foreground': '9aa83a',
			'fontStyle': '\n    ',
			'token': 'constant.other.symbol.ruby'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'variable.language.ruby'
		  },
		  {
			'foreground': 'd9b700',
			'fontStyle': '\n    ',
			'token': 'keyword.other.special-method.ruby'
		  },
		  {
			'foreground': 'd08442',
			'token': 'source.ruby.embedded.source'
		  },
		  {
			'foreground': 'd0b344',
			'fontStyle': '\n    ',
			'token': 'keyword.other.DML.sql'
		  }
		],
		'colors': {
		  'editor.foreground': '#C5C8C6',
		  'editor.background': '#1e1e1e',
		  'editor.selectionBackground': '#373B41',
		  'editor.lineHighlightBackground': '#282A2E',
		  'editorCursor.foreground': '#fc5604',
		  'editorWhitespace.foreground': '#4B4E55'
		}
	})
	editor.setTheme('dimmed-monokai')
}
