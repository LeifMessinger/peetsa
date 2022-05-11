import {Order,Address,Customer,Item,Payment,Store,NearbyStores,Menu} from 'dominos';
import {adjustPriceToIncludeTip, calculateTip, getNearestStore, printStore, readAutobuyJSON, readAutobuyFile, autobuyOrder, printOrder} from './peetsa.js';
import {myAddress, customer} from './customerInfo.js';
import { promises as fs } from "fs";
const testing = true;

async function saveJSONFile(filePath, jsonStringified){
	return fs.writeFile(filePath, jsonStringified, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
	});
}

(async function(){
	//Get the price we're willing to pay, calculate the tip amounts.
	const maxPrice = (!isNaN(process.argv[2]))? parseFloat(process.argv[2]) : 50;
	const tipPercentage = (!isNaN(process.argv[3]))? parseFloat(process.argv[3]) : .1;	//10% tip
	const adjustedMaxPrice = adjustPriceToIncludeTip(maxPrice, tipPercentage);
	const tipAmount = calculateTip(adjustedMaxPrice, tipPercentage);
	console.log("The max price this program will buy is $", maxPrice, " which buys $", adjustedMaxPrice, " amount of food.");
	console.log(adjustedMaxPrice + " + " + tipAmount + " = " + (adjustedMaxPrice + tipAmount) + " = " + maxPrice);

	const store = await getNearestStore(myAddress);
	console.log("Chosen Store:");
	await printStore(store);

	console.log("Autobuy list");
	const autobuyList = await readAutobuyJSON();
	console.assert(Array.isArray(autobuyList));
	console.log(autobuyList);

	const order = await autobuyOrder(new Order(customer), autobuyList, store, adjustedMaxPrice);
	if(order.products.length == 0){
		console.log("Nothing was ordered. You're probably broke.");
		return;
	}
	console.log("Algorithm done.\n");
	
	if(testing){
		console.log("Displaying results...");
		await order.validate();
		await order.price();
		printOrder(order);
		
		console.log("\nSaving order data...");
		await saveJSONFile("./order.json", JSON.stringify(order, null, "\t"));
		console.log("Order data has been saved to " + "./order.json");
		return;
	}
	
	console.assert(!testing);

	myCard.amount = order.amountsBreakdown.customer;
	myCard.tipAmount = calculateTip(order.amountsBreakdown.customer, tipPercentage);

	order.payments.push(myCard);

	//place order
	try{
		//This actually orders the order. Don't do unless hungry
		//testing = false makes it not get here
		await order.place();
		
		printOrder(order);

	}catch(err){
		console.trace(err);

		console.log('\nFailed Order Probably Bad Card, here is order.priceResponse the raw response from Dominos\n');
		console.dir(order.placeResponse, {depth:5});
	}
	
	console.log("\nSaving order data...");
	await saveJSONFile("./order.json", JSON.stringify(order, null, "\t"));
	console.log("Order data has been saved to " + "./order.json");
	
	//I forgot where the nutrition data went
	/*const nutritionFilePath = "./nutrition.json";
	fs.writeFile(nutritionFilePath, jsonStringified, 'utf8', function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
	 
		console.log("Nutrition data has been saved to " + nutritionFilePath);
	});*/
})();