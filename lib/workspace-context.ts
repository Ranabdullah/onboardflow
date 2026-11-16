import { AsyncLocalStorage } from 'node:async_hooks';
// One store per verified request. Never share client records between requests.
export const workspaceContext = new AsyncLocalStorage<any>();
