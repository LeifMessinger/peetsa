# peetsa
Domino's API framework with the main functionality being letting you auto-buy items for a certain cost.

### Initialization
All you need to do is `npm install`

## Autobuy Files
Before we order stuff (unless you just want a bunch of pepperoni pizzas and sodas), we're going to want to take a look at the menu.

Run `npm run menu` to fetch your nearest Domino's store's menu.

If you have a command line that can scroll, then great. There are other ways to view this, like on linux you can do `npm run menu | less` or pipe it into a file like `npm run menu > menu.txt`

The main idea of this program is to give it a certain amount of money to spend, and it spends it all.

Auto buy systems are perfect in that changing the quantity and ordering of items, you can have a machine prioritize important things while never going over budget.

The algorithm goes as follows:

- Start at the top of the list.
- If the price of the item is less than the maximum price (basically means if you can afford it), put it in the cart and subtract the price from the maximum price.
- Loop until you reach the end

A simple autobuy text file would look like
```
14SCREEN
F_SCBRD
14SCREEN
14SCREEN
14SCREEN
14SCREEN
14SCREEN
F_SCBRD
2LCOKE
2LCOKE
2LCOKE
```
Let's say stuffed cheesy breadsticks are $10, cheese pizza is (14SCREEN) is $15 and a soda (2LCOKE) is $3.

Everyone knows you go to Domino's for the pizza, no matter how much they want to advertise that they sell other things. So you put the pizza at the start.

If I have a pizza, I'll want some breadsticks to go with it, so I'll put that next.

Then you have a long line of extra pizza in case you are spending a lot of money and need party rations. Not going to spend $10 on breadsticks if $15 on pizza gives people twice the amount of food.

Then if you still have money left over, why not spend it on an extra plate of breadsticks?

Then you buy the sodas. Sodas aren't nessesary for the pizza ordering experience. They're just nice-to-haves that round up your dollar count to a good number.

Autobuys are highly flexible for a single dimension, the amount of money you're willing to spend.

If you want to have an even amount of peperoni and combo pizza, then you'd normally just alternate the pizzas, but the domino's api lets you order half pepperoni and half combo pizzas.

The final implementation uses a JSON autobuy system which allows for that topping customization, but you can always substitute `readAutobuyJSON` with `readAutobuyFile`.

## Running

To run the file, do `npm run autobuy`

That should give you a print out of what it would buy, hypothetically.

To make it actually place an order, you need to fill in the data in customerInfo.js, and set `testing = false` in the autobuy.js file.

Afterwards it will save the order data to order.json
