import { publishReplay, refCount } from 'rxjs/operators'

export const shareStream = () => (source) =>
  source.pipe(publishReplay(1), refCount())
