import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ooo" is now active!');

	const decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(255, 255, 0, 0.1)',
	});

	let activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	let timeout: NodeJS.Timer | undefined = undefined;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		const text = activeEditor.document.getText();
		let ranges: vscode.Range[] = [];

		// Buscar texto entre comillas "", '' y ``
		const attributeRegEx = /(["'`])(?:(?=(\\?))\2.)*?\1/g;

		let match;
		while ((match = attributeRegEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index + match[0].indexOf(match[1]) + 1);
			const endPos = activeEditor.document.positionAt(match.index + match[0].lastIndexOf(match[1]));
			const range = new vscode.Range(startPos, endPos);
			ranges.push(range);
		}
		
		activeEditor.setDecorations(decorationType, ranges);
		
		context.subscriptions.push(vscode.commands.registerCommand('i18nextLightingKeys.selectKeys', () => {
			vscode.window.activeTextEditor!.selections = ranges.map(range => new vscode.Selection(range.start, range.end));
			vscode.window.showInformationMessage('Claves seleccionadas!');
		}));
	}

	context.subscriptions.push(vscode.commands.registerCommand('i18nextLightingKeys.markingTS', () => {
		vscode.window.showInformationMessage('Sombreando claves!');
	}));
}

export function deactivate() {}
