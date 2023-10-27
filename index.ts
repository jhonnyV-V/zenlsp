import {
  TextDocuments,
  createConnection,
  TextDocumentSyncKind,
  ProposedFeatures,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { test } from './test';

const connection: ProposedFeatures.Connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

connection.onInitialize(() => ({
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Full,
  },
}))

documents.onDidChangeContent(change => {
  connection.sendDiagnostics({
    uri: change.document.uri,
    diagnostics: test(change),
  })
})

documents.listen(connection)
connection.listen()
