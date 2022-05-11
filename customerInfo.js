import {Order,Address,Customer,Item,Payment,Store,NearbyStores,Menu} from 'dominos';
import {getNearestStore, printMenu} from './peetsa.js';

//full address examples
export const myAddress = new Address({
	street:'1234 Fake Street',
	city:'Southlake',
	region:'TX',
	postalCode:'76092'
});

export const customer = new Customer({
		//this could be an Address instance if you wanted 
		address: myAddress,
		firstName: 'Leif',
		lastName: 'Messinger',
		phone: '555-555-5555',
		email: 'leifmessinger@gmail.com'
});

export const myCard = new Payment({
		// dashes are not needed, they get filtered out
		number:'1234-1234-1234-1234',
		
		//slashes not needed, they get filtered out
		expiration:'12/34',
		securityCode:'123',
		postalCode:'12345'
});
//Do myCard.amount = order.amountsBreakdown.customer at checkout
//Do myCard.tipAmount = tipAmount to include the tip with the purchase