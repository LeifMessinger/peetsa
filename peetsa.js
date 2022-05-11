import {Order,Address,Customer,Item,Payment,Store,NearbyStores,Menu} from 'dominos';
import { promises as fs } from "fs";

export function adjustPriceToIncludeTip(maxPrice = 5, tipPercentage = .1){
	return maxPrice * (1 / (1 + tipPercentage));
}

export function calculateTip(price = 5, tipPercentage = .1){
	return price * tipPercentage;
}

//Gets the nearest open store with delivery (or not)
//You can get an address by doing customer.address
//Returns a Store object. Use store.info.StoreID to convert to a storeId.
export async function getNearestStore(address, delivery = true){
	//find the nearest store
	const nearbyStores = await new NearbyStores(address);

	let storeId = 0;	//Selected store
	let distance = 100;	//Maximum distance we want to order from
	let storeInfo = {};
	//get closest delivery store
	for(const store of nearbyStores.stores){
		if(checkIfStoreInfoIsGood(store) && ((!delivery) || checkIfStoreInfoDelivers(store)) && store.MinDistance<distance){
			distance = store.MinDistance;
			storeId = store.StoreID;	//I hate it when people capitalize ID. It isn't an abbreviation, it's a shorthand.
			storeInfo = store;
		}
	}
	//console.dir(storeInfo, {depth: 3});

	if(storeId == 0){
		throw ReferenceError('Most likely none of the stores are open');
	}
	const store = await new Store(storeId);
	store.info.MinDistance = distance;	//We wanna tack on this data for our print function
	return store;
}

//Takes an awaited store and returns if it's good
export function checkIfStoreIsGood(store){
	return checkIfStoreInfoIsGood(store.info);
}
export function checkIfStoreInfoIsGood(storeInfo){
	return storeInfo.IsOnlineCapable && storeInfo.IsOpen;
}
//Checks if the store does delivery
export function checkIfStoreDelivers(store){
	return checkIfStoreInfoDelivers(store.info);
}
export function checkIfStoreInfoDelivers(storeInfo){
	//I think IsDeliveryStore might mean isDeliveryOnly
	//But stores with that set to false refuse to deliver, so idk
	return storeInfo.ServiceIsOpen.Delivery && (storeInfo.IsDeliveryStore === true);
}

//Takes an awaited menu object
//You don't have to do this in the autobuyer, because it checks if the items are on the menu
//This is for the getNearestStore function if you absolutely NEED a build your own pizza instead of the bot ordering only 2 drinks for you.
//For safety reasons, throw some extra standard pizzas onto your autobuy just in case they stop doing build your own pizzas.
//Returns true or false depending on if the menu has build your own pizza or not
export async function menuHasBuildYourOwn(menu){
	return menu["menu"]["categories"]["food"]["pizza"]["subCategories"]["buildYourOwn"]["products"].includes("S_PIZZA"); //Another hilarious Leif oneliner. If you hate them, turn on text wrap
}

//I know it's a real stupid function because I am trying to minimise API calls because they are slow.
//Menu is an awaited menu object, like await Menu(storeId), or a menu that has already been made
export function printMenu(menu){
	console.dir(menu, {depth: 5});
}

//Takes an Order object and prints it
export function printOrder(order, tipPercentage = .1){
	const orderPlaced = (order.placeResponse == undefined || order.placeResponse == {});
	if(orderPlaced){
		console.log("Order placed on " + order.priceOrderTime);
		console.log("Estimated minutes: " + order.estimatedWaitMinutes + "minutes.");
	}
	console.dir(order.products);
	console.log("The food cost " + order.amountsBreakdown.foodAndBeverage + " " + order.currency + ".");
	console.log("The tax is " + order.amountsBreakdown.tax + " " + order.currency + ".");
	console.log("The driver fee is " + order.amountsBreakdown.deliveryFee + " " + order.currency + " (Not including tip).");
	console.log("With " + calculateTip(order.amountsBreakdown.customer, tipPercentage) + " " + order.currency +  " tip, the whole thing comes out to be " + order.amountsBreakdown.customer * (tipPercentage + 1) + " " + order.currency);
	//Save nutrition data to nutrition.json
	//Save order data to order.json
}

//Takes a Store and prints it
export function printStore(store){
	return printStoreInfo(store.info);
}
export function printStoreInfo(storeInfo){
	//console.dir(storeInfo, {depth: 3});
	console.log(storeInfo.StoreID, storeInfo.MinDistance, storeInfo.AddressDescription);
}

//Reads simple autobuy file, aka item codes separated by newlines
//Not the most efficient as cupons might not apply to separate 1 quantity items.
//Returns an autobuy list
export async function readAutobuyFile(fileName = './autobuy.txt'){
	//Chances are, when we get around to doing full JSON autobuy files, we won't be using files and might be using sockets or something.
	const plaintext = new String(await fs.readFile(fileName, 'utf8'));
	return plaintext.split("\n").filter(line => line != "").map(line => { return {code:line}});
}
//Reads the autobuy json object from autobuy.json
//Returns an autobuy list
export async function readAutobuyJSON(fileName = './autobuy.json'){
	//Chances are, when we get around to doing full JSON autobuy files, we won't be using files and might be using sockets or something.
	return JSON.parse(await fs.readFile(fileName, 'utf8'));
}

//Constructs an order object with all the things in the autobuyList
//Takes an already awaited Order object. This is so that you can specify things like order.serviceMethod='Carryout'
//The maxPrice doesn't account for tips, so make sure to calculate that before you call this function
//Order.products will be an empty array if nothing is bought. This needs to be checked or else order.price will throw an error.
//Returns an Order object
export async function autobuyOrder(order, autobuyList, store, maxPrice){
	const menu = store.menu;
	console.assert(checkIfStoreIsGood(store)); //You think this doesn't matter since we checked for it before, but I once ran this at 9 or something and this caugtht it.
	order.storeID = store.info.StoreID;
	//Push every single coupon in menu to the order
	order.addCoupon("AllStoreCoupons");	//Hopefully they don't dick me here and this actually does what it says
	order.addCoupon("allStoreCoupons");

	//TODO: Consult the menu first to elminate more API calls before checking the price.

	while(autobuyList.length >= 1){		//Idk how temps would work, so I'm just adding and removing items from the real order
		const item = new Item(autobuyList.shift());
		item.qty = Math.min(item.qty, maxPrice / 1);
		console.log(item);
		order.addItem(item);
		try{
			await order.validate();
			await order.price();
			while(item.qty > 1 && order.amountsBreakdown.customer>=maxPrice){
				order.removeItem(item);
				item.qty -= 1;
				order.addItem(item);
				await order.validate();
				await order.price();
			}
			if(order.amountsBreakdown.customer>=maxPrice){
				order.removeItem(item);
			}
		}catch(e){
			console.dir(e,{depth:3});
			console.log("It didn't seem to like that item");
			order.removeItem(item);
		}
	}
	return order;
}