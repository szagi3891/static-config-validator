import { z } from "npm:zod";
import { CheckByZod } from "./utils/lib.ts";
import { showErrorAndExit } from "./utils/showErrorAndExit.ts";
import { loadRules } from "./loadEslint.ts";

const RuleZod = z.record(
    z.string(),
    z.unknown()
);

const ConfigZod = new CheckByZod('ConfigZod', RuleZod);

const RulesConfig = {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/ban-ts-comment": "error",

    "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",

    "@typescript-eslint/no-unsafe-function-type": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-enum-comparison": "error",
    "@typescript-eslint/no-unsafe-declaration-merging": "error",
    "@typescript-eslint/no-unsafe-unary-minus": "error",

    /*
    Nie pozwala na zawężenie typu, prowadzące do błędu
    function f() {
        return Math.random() < 0.5 ? 42 : 'oops';
    }
    const z = f() as number;
    */
    "@typescript-eslint/no-unsafe-type-assertion": "error",

    "no-unsafe-optional-chaining": ["error", {
        "disallowArithmeticOperators": true
    }],

    // służy do wykrywania niepotrzebnych warunków w kodzie TypeScript.
    // Jej głównym celem jest identyfikacja warunków, które zawsze zwracają
    // true, false lub są zbędne ze względu na typy lub logikę programu.
    "@typescript-eslint/no-unnecessary-condition": ["error", {
        "allowConstantLoopConditions": true
    }],

    //Wymaga żeby w warunku występowała zawsze wartość logiczna
    "@typescript-eslint/strict-boolean-expressions": "error",

    //Zabrania takich konstrukcji:
    //const includesBaz = example.property!.includes('baz');
    //Dozwolona jest taka
    //const includesBaz = example.property?.includes('baz') ?? false;
    "@typescript-eslint/no-non-null-assertion": "error",

    //pomaga zapewnić, że instrukcje switch są wyczerpujące i obsługują wszystkie
    //możliwe wartości typu unijnego. Jest szczególnie przydatna w projektach,
    //gdzie ważne jest unikanie błędów związanych z nieobsłużonymi przypadkami.
    "@typescript-eslint/switch-exhaustiveness-check": "error",

    //Preferuje ts-expect-error
    "@typescript-eslint/prefer-ts-expect-error": "error",

    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "no-unused-expressions": "error",
}

export async function checkEslint() {

    // const result = await execAndGet('.', 'pnpx eslint --print-config path/to/your/file.js');
    const result = await loadRules();

    const data = ConfigZod.jsonParse(result);

    if (data.type === 'error') {
        console.info('check exlint', data.error.stringifySort());
        Deno.exit(1);
    }

    for (const [ruleName, ruleExpected] of Object.entries(RulesConfig)) {
        const def = data.data[ruleName];

        if (def === undefined) {
            return showErrorAndExit([
                `Definitions are missing: ${ruleName}`,
                `Expected value:`,
                JSON.stringify(ruleExpected, null, 4)
            ]);
        }

        if (JSON.stringify(def) === JSON.stringify(ruleExpected)) {
            delete data.data[ruleName];
        } else {
            return showErrorAndExit([
                `Value other than expected: ${ruleName}`,
                `Current:`,
                JSON.stringify(def, null, 4),
                `Expected value:`,
                JSON.stringify(ruleExpected, null, 4)
            ]);
        }
    }
    
    console.info('\n\n\n');
    console.info(JSON.stringify(data.data, null, 4));
    console.info('\n\n\n');

    console.log(`%cEslint configuration ok`, 'color: green;');
}
