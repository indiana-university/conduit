import {Observable} from 'rxjs/Observable';

import {debug} from '../../operator/debug';

Observable.prototype.debug = debug;
