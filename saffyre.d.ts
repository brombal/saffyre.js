import * as express from 'express';
declare namespace saffyre {
  interface SaffyreOptions {
    ext: string;
  }
}
declare function saffyre(dir: string, options?: saffyre.SaffyreOptions): express.Handler;
export = saffyre;
