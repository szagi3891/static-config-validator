
export const showErrorAndExit = (messages: Array<string>) => {
    console.info('\n\n');
    for (const message of messages) {
        console.log(`%c${message}`, 'color: red;');
    }
    console.info('\n\n');
    Deno.exit(1);
};
