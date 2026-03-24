import { readFileSync, writeFileSync } from 'fs';

export interface Context {
  role: 'user' | 'me';
  text: string;
};

export class ContextModule {
  private contextPath = 'context.json';
  private contextsMap = new Map<'ctx', Context[]>();

  get(): Context[] {
    const existingContext = this.contextsMap.get('ctx');

    if (existingContext) {
      return existingContext;
    }

    const context = readFileSync(this.contextPath, { encoding: 'utf-8' });

    const parsed = JSON.parse(context) as Context[];

    this.contextsMap.set('ctx', parsed);

    return parsed;
  }

  add(contextToPush: Context) {
    const context = this.get();

    context.push(contextToPush);

    writeFileSync(this.contextPath, JSON.stringify(context, null, 2));

    this.contextsMap.set('ctx', context);
  }

  clear() {
    this.contextsMap.delete('ctx');

    writeFileSync(this.contextPath, JSON.stringify([]));
  }
}
