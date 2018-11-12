import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import { loadWASM } from 'onigasm'

const onigasm = loadWASM('theme/editor/static/onigasm.wasm')

export async function iniEditor({ editor, languages }) {
	await onigasm // only load onigasm once
	const typescript = new Registry({
		getGrammarDefinition: async () => ({
			format: 'json',
			content: await (await fetch('theme/editor/static/TypeScript.tmLanguage.json')).text(),
		})
	})
	await wireTmGrammars({ languages }, typescript, new Map([['typescript', 'source.ts']]))
	editor.defineTheme('dimmed-monokai', await (await fetch('theme/editor/static/dimmed-monokai.json')).json())
	editor.setTheme('dimmed-monokai')
}
