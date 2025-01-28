import { checkEslint } from "./src/checkEslint.ts";

console.info('Static config validator - start');

await checkEslint();


//TODO - walidacja deno.json

//TODO - walidacja tsconfig.json

//TODO - walidacja eslintów

//TODO - https://www.youtube.com/watch?v=zeNh4fuJhcA

// "compilerOptions": {
//     "noUncheckedIndexedAccess": true,
//     "noPropertyAccessFromIndexSignature": true
//   }


//Listować pliki które mają całkowicie wyłaczonego eslint
/* eslint-disable */

//listować wykluczenia ts-a
//listować miejsca gdzie jest wyłączony TS

