const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let numberoflikes=0

suite('Functional Tests', function () {

    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get("/api/stock-prices?stock=GOOG")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.equal(res.body.stockData.stock,'GOOG');
                assert.isNumber(res.body.stockData.price);
               
                done();
            })

    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.equal(res.body.stockData.stock,'GOOG');
                assert.isNumber(res.body.stockData.price);
                assert.isAtLeast(res.body.stockData.likes,1)
                numberoflikes=res.body.stockData.likes
               
                done();
            })

    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get("/api/stock-prices?stock=GOOG&like=true")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.equal(res.body.stockData.stock,'GOOG');
                assert.isNumber(res.body.stockData.price);
                assert.equal(res.body.stockData.likes,numberoflikes)
               
                done();
            })

    });

    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get("/api/stock-prices?stock=GOOG&stock=MSFT")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData[0].stock,"GOOG")
                assert.equal(res.body.stockData[1].stock,"MSFT")
          
               
                done();
            })

    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get("/api/stock-prices?stock=GOOG&stock=MSFT")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, "application/json");
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData[0].stock,"GOOG")
                assert.equal(res.body.stockData[1].stock,"MSFT")
                assert.isNumber(res.body.stockData[0].rel_likes)
                assert.isNumber(res.body.stockData[1].rel_likes)
          
               
                done();
            })

    });




});
