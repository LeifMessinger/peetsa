import {getNearestStore, printMenu} from './peetsa.js';
import {myAddress} from './customerInfo.js';

(async function(){
	printMenu((await getNearestStore(myAddress)).menu);
})();