const fs = require('fs');
const ts = require('typescript');
const path = 'h:/Softvence omega/lawlax/lawalx_frontend/app/(Admin)/admin/(content)/dashboard/page.tsx';
const content = fs.readFileSync(path, 'utf8');
const sf = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const diagnostics = ts.getPreEmitDiagnostics(sf);
console.log('diag count', diagnostics.length);
diagnostics.forEach(d => {
  const loc = sf.getLineAndCharacterOfPosition(d.start || 0);
  console.log(`${loc.line + 1}:${loc.character + 1}`, ts.flattenDiagnosticMessageText(d.messageText, '\n'));
});
