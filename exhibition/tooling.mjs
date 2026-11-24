import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
export function dependencies(){
 const local=createRequire(import.meta.url);
 try{local.resolve('esbuild');local.resolve('three');return local}catch{}
 const bundled=createRequire(path.join(os.homedir(),'.codex','skills','teardown','package.json'));
 bundled.resolve('esbuild');return bundled;
}
