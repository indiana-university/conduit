import {Observable} from 'rxjs/Observable';

import {shareStream} from '../../operator/shareStream';

Observable.prototype.shareStream = shareStream;
