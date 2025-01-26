import ts from "npm:typescript";
import { readFileSync } from "node:fs";

// Funkcja do wczytania pliku
function readConfigFile(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

function parseConfig(fileContent: string): string {
    // Utwórz SourceFile z zawartości pliku
    const sourceFile = ts.createSourceFile(
        "config.mjs", // Nazwa pliku
        fileContent,  // Zawartość pliku
        ts.ScriptTarget.Latest, // Cel parsowania (najnowsza wersja ECMAScript)
        true // Ustaw flagę `setParentNodes` na true, aby zachować informacje o hierarchii węzłów
    );
  
    // Funkcja do przeszukiwania AST
    function findRules(node: ts.Node): ts.ObjectLiteralExpression | null {
        if (
            ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === "rules"
        ) {
            if (ts.isObjectLiteralExpression(node.initializer)) {
                return node.initializer;
            }
        }

        // Przeszukaj dzieci węzła
        return ts.forEachChild(node, findRules) || null;
    }
  
    // Znajdź obiekt `rules`
    const rulesNode = findRules(sourceFile);
    if (!rulesNode) {
        throw Error('expect rules');
    }
  
    // Przekształć węzeł AST na tekst
    const rulesText = rulesNode.getText(sourceFile);
  
    // Zwróć tekst jako `unknown` (bez parsowania na obiekt)
    return rulesText;
}

export const loadRules = (): string => {
    const filePath = "./eslint.config.mjs";
    const fileContent = readConfigFile(filePath);

    const rules = parseConfig(fileContent);
    return rules;
};
