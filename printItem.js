import {Order, Item} from 'dominos';
import {getNearestStore, printOrder} from './peetsa.js';
import {myAddress, customer} from './customerInfo.js';

(async function(){
	const item = new Item({
		"code":(process.argv[2] || "14SCREEN"),
		"qty": (process.argv[3] || 1)
	});
	console.dir(item);
	const order = new Order(customer);
	order.addCoupon("AllStoreCoupons");
	order.addCoupon("allStoreCoupons");
	const store = await getNearestStore(myAddress);
	order.storeID = store.info.StoreID;
	order.addItem(item);
	await order.price();
	console.dir(order, {depth: 8});
	printOrder(order);
})();