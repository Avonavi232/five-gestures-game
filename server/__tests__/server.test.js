const {expect} = require('chai');
const fromServer = require('../server');

const io = require('socket.io-client');

const socketURL = port => `http://localhost:${port}`;

const socketOptions ={
    transports: ['websocket'],
    'force new connection': true
};


describe('evaluateMatchResult func test', function () {
    var players;

    beforeEach(function () {
        fromServer.listen(1234);

        players = {
            winner: {
                gesture: '',
                wins: 0
            },
            loser: {
                gesture: '',
                wins: 0
            }
        };

    });

    after(function () {
        fromServer.close();
    });


    it('evaluateMatchResult should return winner name if someone win 1', function () {
        players.winner.gesture = 'paper';
        players.loser.gesture = 'rock';
        const result = fromServer.evaluateMatchResult(players, fromServer.gesturesTable);
        expect(result).equal('winner');
    });

    it('evaluateMatchResult should return winner name if someone win 2', function () {
        players.winner.gesture = 'spock';
        players.loser.gesture = 'scissors';
        const result = fromServer.evaluateMatchResult(players, fromServer.gesturesTable);
        expect(result).equal('winner');
    });

    it('evaluateMatchResult should return winner name if someone win 3', function () {
        players.winner.gesture = 'lizard';
        players.loser.gesture = 'spock';
        const result = fromServer.evaluateMatchResult(players, fromServer.gesturesTable);
        expect(result).equal('winner');
    });

    it('evaluateMatchResult should return winner with incremented win field', function () {
        players.winner.gesture = 'lizard';
        players.loser.gesture = 'spock';
        const result = fromServer.evaluateMatchResult(players, fromServer.gesturesTable);
        expect(players.winner.wins).equal(1);
    });

    it('evaluateMatchResult return undefined if no players passed', function () {
        const result = fromServer.evaluateMatchResult(null, fromServer.gesturesTable);
        expect(result).equal(undefined);
    });

    it('evaluateMatchResult return undefined if no gestures table passed', function () {
        players.winner.gesture = 'spock';
        players.loser.gesture = 'scissors';
        const result = fromServer.evaluateMatchResult(players);
        expect(result).equal(undefined);
    });

    it('evaluateMatchResult return undefined if players object is not filled properly', function () {
        players.winner.gesture = '';
        players.loser.gesture = '';
        const result = fromServer.evaluateMatchResult(players, fromServer.gesturesTable);
        expect(result).equal(undefined);
    });
});


describe('evaluateGameResult func test', function () {
    var players;

    beforeEach(function () {
        fromServer.listen(1234);

        players = {
            winner: {
                wins: 0
            },
            loser: {
                wins: 0
            }
        };

    });

    after(function () {
        fromServer.close();
    });


    it('evaluateGameResult should return winner name if winner.wins > loser.wins', function () {
        players.winner.wins = 2;
        players.loser.wins = 1;
        const result = fromServer.evaluateGameResult(players);
        expect(result).equal('winner');
    });

    it('evaluateGameResult should return false if winner.wins === loser.wins', function () {
        players.winner.wins = 2;
        players.loser.wins = 2;
        const result = fromServer.evaluateGameResult(players);
        expect(result).equal(false);
    });

    it('evaluateGameResult should return undefined if no players object passed', function () {
        const result = fromServer.evaluateGameResult();
        expect(result).equal(undefined);
    });
});


describe('checkReadyToPlay func test', function () {
    var players;

    beforeEach(function () {
        fromServer.listen(1234);

        players = {
            winner: {}
        };

    });

    after(function () {
        fromServer.close();
    });


    it('checkReadyToPlay should return true if players object contains more than 1 players', function () {
        players.loser = {};
        const result = fromServer.checkReadyToPlay(players);
        expect(result).equal(true);
    });


    it('checkReadyToPlay should return false if players object contains less than 2 players', function () {
        const result = fromServer.checkReadyToPlay(players);
        expect(result).equal(false);
    });


    it('checkReadyToPlay should return undefined if no players passed', function () {
        const result = fromServer.checkReadyToPlay();
        expect(result).equal(undefined);
    });
});


describe('checkPlayersDidTurns func test', function () {
    var players;

    beforeEach(function () {
        fromServer.listen(1234);

        players = {
            winner: {
                gesture: ''
            },
            loser: {
                gesture: ''
            },
        };

    });

    after(function () {
        fromServer.close();
    });


    it('checkPlayersDidTurns should return true if all players did turn', function () {
        players.winner.gesture = 'rock';
        players.loser.gesture = 'rock';
        const result = fromServer.checkPlayersDidTurns(players);
        expect(result).equal(true);
    });

    it('checkPlayersDidTurns should return false if not all players did turn', function () {
        players.winner.gesture = 'rock';
        const result = fromServer.checkPlayersDidTurns(players);
        expect(result).equal(false);
    });

    it('checkPlayersDidTurns should return undefined', function () {
        const result = fromServer.checkPlayersDidTurns();
        expect(result).equal(undefined);
    });

});


describe('Socket tests', function () {
    var client;

    beforeEach(function () {
        fromServer.listen(1234);
        client = io.connect(socketURL(1234), socketOptions);
    });

    afterEach(function () {
        fromServer.close();
        client = null;
    });



    it('Socket client connects succesful', function (done) {
        client.on('connect', function () {
            done();
        })
    });


    // it('200 socket clients connect succesful', function (done) {
    //     const clients = [];
    //     const toDisconnect = [];
    //
    //     for (let i = 0; i < 200; i++) {
    //         const p = new Promise(resolve => {
    //             const client = io.connect(socketURL(1234), socketOptions);
    //             toDisconnect.push(client);
    //             client.on('connect', resolve);
    //         })
    //     }
    //
    //     Promise.all(clients)
    //         .then(() => {
    //             toDisconnect.forEach(client => client.emit('forceDisconnect'));
    //         })
    //         .then(() => done());
    //
    // });

    describe('createNewRoom socket event test', function () {
        it('socket joined to the room with roomID', function (done) {
            const params = {
                playerID: 'asdf',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', () => {
                done()
            });

            client.emit('createNewRoom', params);
        });

        it('should emit back object with keys', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                expect(object).keys('roomID', 'playerID', 'settings');
                client.emit('forceDisconnect');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('should emit back playerID', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                expect(object.playerID).equal('newPlayer');
                client.emit('forceDisconnect');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('should emit back roomID', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                expect(object.roomID.length).above(0);
                client.emit('forceDisconnect');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('should emit back appropriate settings object', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                expect(object.settings).eql({ chatEnable: true, maxScore: 3 });
                client.emit('forceDisconnect');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('should push new object in global rooms var', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                const roomID = object.roomID;
                expect(fromServer.rooms[roomID]).instanceOf(Object);
                client.emit('forceDisconnect');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('should delete object in global rooms var when last player disconnected', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            let roomID = '';

            client.on('disconnect', () => {
                expect(fromServer.rooms[roomID]).equal(undefined);
                done();
            });

            client.on('roomEntered', object => {
                roomID = object.roomID;
                client.emit('forceDisconnect');
            });

            client.emit('createNewRoom', params);
        });

        it('emit error if no playerID passed', function (done) {
            const params = {
                maxScore: 3,
                chatEnable: true
            };

            const timer = setTimeout(() => {done(new Error)}, 500);

            client.on('myError', ({error}) => {
                clearTimeout(timer);
                done(error)
            });

            client.emit('createNewRoom', params);
        });

        it('emit error if no maxScore, chatEnable passed', function (done) {
            const params = {
                playerID: '123'
            };

            client.on('roomEntered', ({error}) => {
                done(error)
            });

            client.emit('createNewRoom', params);
        });
    });


    describe('knockToRoom socket event test', function () {
        var client2;
        var roomID = '';

        beforeEach(function (done) {
            fromServer.listen(1234);

            const params1 = {
                playerID: 'winner',
                maxScore: 3,
                chatEnable: true
            };

            let firstConnected = false;

            client.on('roomEntered', object => {
                roomID = object.roomID;
                if (!firstConnected) {
                    firstConnected = true;
                    done();
                }
            });

            client.emit('createNewRoom', params1);


            client2 = io.connect(socketURL(1234), socketOptions);
        });

        afterEach(function () {
            fromServer.close();
            client = null;
        });


        it('success connect to existing room', function (done) {
            const params = {
                roomID,
                playerID: 'loser'
            };

            client2.on('roomEntered', object => {
               expect(fromServer.rooms).have.property(object.roomID);
               done();
            });

            client2.emit('knockToRoom', params);
        });


        it('fail connect to non-existing room', function (done) {
            const params = {
                roomID: 'non-existing-room',
                playerID: 'loser'
            };

            client2.on('myError', () => {
               done();
            });

            client2.emit('knockToRoom', params);
        });


        it('fail connect without playerID', function (done) {
            const params = {
                roomID
            };

            client2.on('myError', () => {
               done();
            });

            client2.emit('knockToRoom', params);
        });
    });
});

































