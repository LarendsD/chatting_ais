import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { isErrnoException } from './utils/isErrnoException.js';
import { join } from 'path';

export interface Context {
  role: 'user' | 'me';
  text: string;
};

export class ContextModule {
  private contextFolder = 'contexts';
  private contextsMap = new Map<string, Context[]>();

  constructor() {
    mkdirSync(this.contextFolder, { recursive: true });
  }

  private getContextPath(id: string) {
    return join(this.contextFolder, `${id}.json`);
  }

  private readOrCreateFromFile(contextPath: string) {
    let context = '[]';

    try {
      context = readFileSync(contextPath, { encoding: 'utf-8' });
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') {
        writeFileSync(contextPath, '[]');
      } else {
        throw error;
      }
    }

    return context;
  }

  get(id: string): Context[] {
    const existingContext = this.contextsMap.get(id);

    if (existingContext) {
      return existingContext;
    }

    const path = this.getContextPath(id);

    const context = this.readOrCreateFromFile(path);

    const parsed = JSON.parse(context) as Context[];

    this.contextsMap.set(id, parsed);

    return parsed;
  }

  add(id: string, contextToPush: Context) {
    const context = this.get(id);

    context.push(contextToPush);

    const path = this.getContextPath(id);

    writeFileSync(path, JSON.stringify(context, null, 2));

    this.contextsMap.set('ctx', context);
  }

  clear(id: string) {
    this.contextsMap.delete(id);

    const path = this.getContextPath(id);

    writeFileSync(path, JSON.stringify([]));
  }
}
