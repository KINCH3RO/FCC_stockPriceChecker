'use strict';
const { log } = require('console');
const https = require('https')
const mongoose = require('mongoose');

function getStock(stockSymbol, like, ipaddress, callback) {
  let data = '';
  let request = https.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
      res.resume();
      callback({ "stockData": { "error": "external source error", "likes": 0 } })
      return;
    }

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', async () => {
      data = JSON.parse(data)
      let stockData = {}
      let result = undefined
      if (typeof data == 'string') {
        callback({ "stockData": { "error": "external source error", "likes": 0 } })
        return
      }


      let x = await StockModel.findOne({ symbol: stockSymbol })
      if (!x) {
        let stockDB = { symbol: stockSymbol }
        if (like) {
          stockDB.likesIP = [ipaddress]
          stockDB.likesCount = 1
        } else {
          stockDB.likesIP = []
          stockDB.likesCount = 0
        }
        let ourStock = new StockModel(stockDB)
        result = await ourStock.save()

      } else {


        if (like && !x.likesIP.includes(ipaddress)) {
          x.likesIP.push(ipaddress)
          x.likesCount = x.likesIP.length
          x.save()
        }

        result = x;

      }
      stockData.stock = stockSymbol
      stockData.price = data.latestPrice
      stockData.likes = result.likesCount
      callback({ stockData })



    });
  });



}


mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("connected succesfully");
});


const stockSchema = new mongoose.Schema(
  {

    symbol: String,
    likesIP: [String],
    likesCount: Number

  }
)

let StockModel = mongoose.model('stock', stockSchema)

module.exports = function (app) {

  
  app.route('/api/stock-prices')
    .get(function (req, res) {
      let stockSymbol = req.query.stock
      let like = req.query.like == 'true'
      let symbolCount = typeof stockSymbol == 'object'
      let ipaddress = /*req.headers['x-forwarded-for'] |*/ '192.168.1.1'

      if (!stockSymbol) {
        return
      }

      if (!symbolCount) {
        getStock(stockSymbol, like, ipaddress, (data) => {
          res.json(data)
        })

        return
      }

      getStock(stockSymbol[0], like, ipaddress, (firstStock) => {

        getStock(stockSymbol[1], like, ipaddress, (secondStock) => {

          let stockData = []
          stockData.push({
            stock: firstStock.stockData.stock,
            price: firstStock.stockData.price,
            rel_likes: (firstStock.stockData.likes - secondStock.stockData.likes)
          })
          stockData.push({
            stock: secondStock.stockData.stock,
            price: secondStock.stockData.price,
            rel_likes: (secondStock.stockData.likes - firstStock.stockData.likes)
          })
          res.json({ stockData })
        })
      })




    });

};
