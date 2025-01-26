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

    "@typescript-eslint/no-unsafe-function-type": "error",
    "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-enum-comparison": "error",
    "@typescript-eslint/no-unsafe-declaration-merging": "error",
    "no-unsafe-optional-chaining": ["error", {
        "disallowArithmeticOperators": true
    }],
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
