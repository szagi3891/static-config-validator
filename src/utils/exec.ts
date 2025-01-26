import { throwError } from './lib.ts'

export async function exec(
    cwd: string,
    commandStr: string,
    env?: Record<string, string>,
  ): Promise<void> {
    const args = commandStr.split(' ');

    const commandParam: string = args.shift() ?? throwError('expected command');

    const command = new Deno.Command(commandParam, {
        args,
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
        cwd,
        env: {
            ...Deno.env.toObject(),
            ...(env ?? {}),
        }
    });

    const child = command.spawn();

    const output = await child.output();
    const { code, /*stdout, stderr*/ } = output;

    Deno.addSignalListener('SIGINT', () => {
        child.kill();
    });

    // if (stderr.length > 0) {
    //     throw new Error(new TextDecoder().decode(stderr));
    // }

    if (code !== 0) {
        console.info(`CWD: ${cwd}`);
        console.info(`COMMAND: ${commandStr}`);

        throw new Error(`error code !== 0 ==> ${code}`);
    }

    // return new TextDecoder().decode(stdout);
}


export async function execAndGet(
    cwd: string,
    commandStr: string,
    env?: Record<string, string>,
  ): Promise<string> {
    const args = commandStr.split(' ');

    const commandParam: string = args.shift() ?? throwError('expected command');

    const command = new Deno.Command(commandParam, {
        args,
        stdin: 'inherit',
        stdout: 'piped',
        stderr: 'inherit',
        cwd,
        env: {
            ...Deno.env.toObject(),
            ...(env ?? {}),
        }
    });

    const child = command.spawn();

    const output = await child.output();
    const { code, stdout, /*stderr*/ } = output;

    Deno.addSignalListener('SIGINT', () => {
        child.kill();
    });

    // if (stderr.length > 0) {
    //     throw new Error(new TextDecoder().decode(stderr));
    // }

    if (code !== 0) {
        console.info(`CWD: ${cwd}`);
        console.info(`COMMAND: ${commandStr}`);

        throw new Error(`error code !== 0 ==> ${code}`);
    }

    return new TextDecoder().decode(stdout);
}

// const decoder = new TextDecoder("utf-8");
// const encoder = new TextEncoder();

// export async function execFormat(
//     cwd: string,
//     commandStr: string,
//     format: (message: string) => string,
//     env?: Record<string, string>,
//   ): Promise<void> {
//     const args = commandStr.split(' ');

//     const commandParam: string = args.shift() ?? throwError('expected command');

//     const command = new Deno.Command(commandParam, {
//         args,
//         stdin: 'inherit',
//         stdout: 'piped',
//         stderr: 'inherit',
//         cwd,
//         env: {
//             ...Deno.env.toObject(),
//             ...(env ?? {}),
//         }
//     });

//     const child = command.spawn();

//     const result = new PromiseBox<void>();

//     (async () => {
//         for await (const message of child.stdout) {
//             const decodedString = decoder.decode(message);
//             const formatString = format(decodedString);
//             Deno.stdout.write(encoder.encode(formatString));
//         }

//         result.resolve();
//     })();

//     // (async () => {
//     //     for await (const message of child.stderr) {
//     //         Deno.stderr.write(message);
//     //     }
//     // })();

//     (async () => {
//         const status = await child.status;

//         console.info(`Exit status = ${status} cwd=${cwd} commandStr=${commandStr}`);
//         result.resolve();
//     })();

//     Deno.addSignalListener('SIGINT', () => {
//         child.kill();
//     });

//     await result.promise;
// }
