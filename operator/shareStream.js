import {publishReplay} from 'rxjs/operator/publishReplay';

export function shareStream() {
  return this::publishReplay(1).refCount();
}
