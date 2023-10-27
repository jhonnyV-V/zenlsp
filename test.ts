import { DiagnosticSeverity, TextDocumentChangeEvent, Diagnostic } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

const getVersion = (text: string): string => {
  const hasVersion = /Rule check version [0-9]\.\d*\.\d/gi;
  const version = /[0-9]\.\d*\.\d/gi;
  if (hasVersion.test(text)) {
    const match = version.exec(text);
    if (match != null) {
      return match[0];
    }
    return "";
  }
  return "";
};

export function test(textDocument: TextDocumentChangeEvent<TextDocument>) {
  //const uriToData: Map<string, any> = new Map();
  const testContract: string = `
  Rule check version 3.18.1
  Scenario 'credential': issuer create the credential signature
  Given my name is in a 'string' named 'did'
  and I have my valid 'keyring'
  Given that I have a 'issuer public key'
  Given I have a 'credential request'
  when I create the credential signature
  Then print data`;
  const version = getVersion(testContract);
  const ruleRegex = /Rule/ig;
  const givenRegex = /(Given|have)/ig;
  const whenRegex = /When/ig;
  const thenRegex = /Then/ig;
  const variableRegex = /'*'\w+/g
  const lines = testContract.split("\n");
  const rules = [];
  const givens = [];
  const whens = [];
  const thens = [];
  const diagnostics: Diagnostic[] = [];
  let variables: any[] = [];
  const keywords = ['string'];

  let isInGiven = true;
  let isInWhen = false;
  let isInThen = false;
  for (let i = 0; i < lines.length; i++) {
    const line: string = lines[i];
    if (ruleRegex.test(line)) {
      if (isInGiven) {
        rules.push(line.trim());
      } else {
        //TODO: add diagnostic of wrong sintax
        //rule should be on top
      }
    }
    if (givenRegex.test(line)) {
      if (isInGiven) {
        givens.push(line.trim());
      } else {
        //TODO: add diagnostic of wrong sintax
      }
    }
    if (whenRegex.test(line)) {
      if (isInGiven) {
        isInWhen = false;
        isInWhen = true;
        whens.push(line.trim());
      } else if (isInWhen) {
        whens.push(line.trim());
      } else {
        //TODO: add diagnostic of wrong sintax
      }
    }
    if (thenRegex.test(line)) {
      if (isInWhen || isInGiven) {
        isInWhen = false;
        isInGiven = false;
        isInThen = true;
        thens.push(line.trim());
      } else if (isInThen) {
        thens.push(line.trim());
      } else {
        //TODO: add diagnostic of wrong sintax
      }
    }
  }
  console.log(version);
  if (!version) {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: {
        start: textDocument.document.positionAt(0),
        end: textDocument.document.positionAt(1),
      },
      message: "You should have a Rule check version at the top of your contract",
      source: 'zencode-lsp',
    });
  }
  console.log(rules);
  //TODO: verify that all the rules are valid
  console.log(givens);
  for (let line of givens) {
    const match = line.match(/\'(.*?)\'/ig);
    const filteredMatch = match?.map((variable: string) => {
      return variable.replaceAll("'", '');
    }).filter((variable: string) => {
      return !keywords.includes(variable);
    }) || [];
    variables = [...variables, ...filteredMatch];
  }
  console.log(whens);
  console.log(thens);
  console.log(variables);
  return diagnostics;
}
/*
const getBlacklisted = (text: string) => {
  const blacklist = [
    'foo',
    'bar',
    'baz',
  ]
  const regex = new RegExp(`\\b(${blacklist.join('|')})\\b`, 'gi')
  const results: {value: string, index: number}[] = []
  let matches
  while ((matches = regex.exec(text)) && results.length < 100) {
    results.push({
      value: matches[0],
      index: matches.index,
    })
  }
  return results
}

const blacklistToDiagnostic = (textDocument: TextDocument) => (
  { index, value }: { index: number, value: string }
) => ({
  severity: DiagnosticSeverity.Warning,
  range: {
    start: textDocument.positionAt(index),
    end: textDocument.positionAt(index + value.length),
  },
  message: `${value} is blacklisted.`,
  source: 'Blacklister',
})
*/
