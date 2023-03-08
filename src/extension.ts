import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "i18nextLightingKeys" is now active!');

	const decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: "rgba(28, 28, 28, 0.5)",
		// color: "#f7e80a",
		color: "#f7eb0a",
		// fontWeight: "bold",
		borderColor: "#666666",
		borderRadius: "4px",
		// opacity: "0.95",
		overviewRulerColor: "#ffcc00",
		overviewRulerLane: vscode.OverviewRulerLane.Left
	});

	let activeEditor = vscode.window.activeTextEditor;
	let disableShading = vscode.workspace.getConfiguration().get<boolean>('i18nextLightingKeys.disableShading');

	context.subscriptions.push(
		vscode.commands.registerCommand('i18nextLightingKeys.disableShading', () => {
			vscode.workspace.getConfiguration().update('i18nextLightingKeys.disableShading', true, true);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('i18nextLightingKeys.enableShading', () => {
			vscode.workspace.getConfiguration().update('i18nextLightingKeys.disableShading', false, true);
		})
	);

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

		if (!disableShading) {
			// Buscar texto entre comillas "", '' y ``
			const attributeRegEx = /(["'`])(?:(?=(\\?))\2.)*?\1/g;

			let match;
			while ((match = attributeRegEx.exec(text))) {
				const startPos = activeEditor.document.positionAt(match.index + match[0].indexOf(match[1]) + 1);
				const endPos = activeEditor.document.positionAt(match.index + match[0].lastIndexOf(match[1]));
				const range = new vscode.Range(startPos, endPos);
				ranges.push(range);
			}
		}

		activeEditor.setDecorations(decorationType, ranges);

		context.subscriptions.push(vscode.commands.registerCommand('i18nextLightingKeys.selectKeys', () => {
			vscode.window.activeTextEditor!.selections = ranges.map(range => new vscode.Selection(range.start, range.end));
			vscode.window.showInformationMessage('Textos sombreados seleccionadas!');
		}));
	}

	vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration('i18nextLightingKeys.disableShading')) {
			disableShading = vscode.workspace.getConfiguration().get<boolean>('i18nextLightingKeys.disableShading');
			triggerUpdateDecorations();
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('i18nextLightingKeys.markingTS', () => {
		vscode.window.showInformationMessage('Extensión inicializada! Se ha sombreado el texto..');
	}));
}

export function deactivate() { }
