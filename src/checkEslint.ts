import { z } from "npm:zod";
import { execAndGet } from "./utils/exec.ts";
import { CheckByZod } from "./utils/lib.ts";
import { showErrorAndExit } from "./utils/showErrorAndExit.ts";

const RuleZod = z.record(
    z.string(),
    z.unknown()
);

const ConfigZod = new CheckByZod('ConfigZod', z.object({
    rules: RuleZod
}));

const RulesConfig = {
    "@typescript-eslint/no-explicit-any": [2],
    "@typescript-eslint/await-thenable": [2],
    "@typescript-eslint/no-floating-promises": [2],
    "@typescript-eslint/ban-ts-comment": [2],

    "@typescript-eslint/no-unsafe-function-type": [2],
    "@typescript-eslint/use-unknown-in-catch-callback-variable": [2],
    "@typescript-eslint/no-unsafe-assignment": [2],
    "@typescript-eslint/no-unsafe-member-access": [2],
    "@typescript-eslint/no-unsafe-call": [2],
    "@typescript-eslint/no-unsafe-return": [2],
    "@typescript-eslint/no-unsafe-argument": [2],
    "@typescript-eslint/no-unsafe-enum-comparison": [2],
    "@typescript-eslint/no-unsafe-declaration-merging": [2],
    "no-unsafe-optional-chaining": [2, {
        "disallowArithmeticOperators": false
    }],
}

export async function checkEslint() {

    const result = await execAndGet('.', 'pnpx eslint --print-config path/to/your/file.js');

    const data = ConfigZod.jsonParse(result);

    if (data.type === 'error') {
        console.info('check exlint', data.error.stringifySort());
        Deno.exit(1);
    }

    for (const [ruleName, ruleExpected] of Object.entries(RulesConfig)) {
        const def = data.data.rules[ruleName];

        if (def === undefined) {
            return showErrorAndExit([
                `Definitions are missing: ${ruleName}`,
                `Expected value:`,
                JSON.stringify(ruleExpected, null, 4)
            ]);
        }

        if (JSON.stringify(def) === JSON.stringify(ruleExpected)) {
            //ok
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
    
    console.log(`%cEslint configuration ok`, 'color: green;');
}
