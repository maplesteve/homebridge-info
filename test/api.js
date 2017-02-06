/* eslint-env node, mocha */

var should = require('chai').should(),
    supertest = require('supertest'),
    api = supertest('http://localhost:9876'),
    EventSource = require('eventsource');

describe('Testing the API', function() {
    describe('/api/nonexisting', function() {
        it('returns an error when the method is unknown', function(done) {
            api.get('/api/nonexisting')
            .expect(404)
            .end(function(err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });
    });

    describe('/api/info', function() {
        it('can be subscribed to and returns bridgeInfo', function(done) {
            var es = new EventSource("http://127.0.0.1:9876/api/info");
            es.onmessage = function (m) {
                var result = JSON.parse(m.data);
                result.should.have.property('type', 'bridgeInfo');
                result.should.have.property('data').that.is.an('object');
                result.data.should.have.property('uptime');
                result.data.should.have.property('heap');
                result.data.should.have.property('osInfo');
                result.data.should.have.property('hbVersion');
                done();
            };
        });
    });
});
