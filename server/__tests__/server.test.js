const chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const {expect} = chai;
const fromServer = require('../server');

const io = require('socket.io-client');

const socketURL = port => `http://localhost:${port}`;

const socketOptions = {
    transports: ['websocket'],
    'force new connection': true
};


describe('evaluateMatchResult func test', function () {
    var players;

    beforeEach(function () {
        const listener = fromServer.listen(0);

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
        fromServer.listen(0);

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
        fromServer.listen(0);

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
        fromServer.listen(0);

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
    var socketAddr = '';

    beforeEach(function () {
        const listener = fromServer.listen(0);
        const port = listener.address().port;
        socketAddr = socketURL(port);

        client = io.connect(socketAddr, socketOptions);
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
                expect(object.settings).eql({chatEnable: true, maxScore: 3});
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

        it('new pushed object should have keys: players, maxScore, chatEnabled, matchesPlayed', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                const roomID = object.roomID;
                const newPushedObject = fromServer.rooms[roomID];
                expect(newPushedObject).have.keys('players', 'chatEnable', 'matchesPlayed', 'maxScore');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('new pushed object players should have keys: gesture, wins, losses, status', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                const roomID = object.roomID;
                const playerID = object.playerID;
                const newPushedObject = fromServer.rooms[roomID];

                expect(newPushedObject.players[playerID]).have.keys('gesture', 'wins', 'losses', 'status');
                done();
            });

            client.emit('createNewRoom', params);
        });

        it('player, which have new room created, should have online status initially', function (done) {
            const params = {
                playerID: 'newPlayer',
                maxScore: 3,
                chatEnable: true
            };

            client.on('roomEntered', object => {
                const roomID = object.roomID;
                const playerID = object.playerID;
                const newPushedObject = fromServer.rooms[roomID];

                expect(newPushedObject.players[playerID].status).to.be.equal('online');
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

            const timer = setTimeout(() => {
                done(new Error)
            }, 500);

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


            client2 = io.connect(socketAddr, socketOptions);
        });

        afterEach(function () {
            // fromServer.close();
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

        it('should fail connect to non-existing room', function (done) {
            const params = {
                roomID: 'non-existing-room',
                playerID: 'loser'
            };

            client2.on('myError', () => {
                done();
            });

            client2.emit('knockToRoom', params);
        });

        it('should fail connect without playerID', function (done) {
            const params = {
                roomID
            };

            client2.on('myError', () => {
                done();
            });

            client2.emit('knockToRoom', params);
        });

        it('should fail when user with existing ID in the room try to connect', function (done) {
            const params = {
                roomID,
                playerID: 'winner'
            };

            client2.on('myError', () => {
                done();
            });

            client2.emit('knockToRoom', params);
        });

        it('when not last user disconnects from the room, his status should change to "offline"', function (done) {
            const params = {
                roomID,
                playerID: 'loser'
            };

            client2.on('disconnect', function () {
                expect(fromServer.rooms[roomID].players[params.playerID].status).to.be.equal('offline');
                done();
            });

            client2.on('roomEntered', object => {
                client2.emit('forceDisconnect');
            });

            client2.emit('knockToRoom', params);
        });

        it('success when user reconnects (status changes to "online")', function (done) {
            const params = {
                roomID,
                playerID: 'loser'
            };

            client2.on('disconnect', function () {
                client2 = io.connect(socketAddr, socketOptions);

                client2.on('connect', function () {
                    client2.emit('knockToRoom', params);
                });

                client2.on('roomEntered', () => {
                    expect(fromServer.rooms[roomID].players[params.playerID].status).to.be.equal('online');
                    done();
                });


            });

            client2.on('roomEntered', object => {
                client2.emit('forceDisconnect');
            });

            client2.emit('knockToRoom', params);
        });

        it('emit "startGame" if two players are online', function (done) {
            const params = {
                roomID,
                playerID: 'loser'
            };

            client2.on('startGame', object => {
                done()
            });

            client2.emit('knockToRoom', params);
        });
    });


    describe('playerDidTurn socket event test', function () {
        var client2;
        var roomID = '';

        beforeEach(function (done) {
            const params1 = {
                playerID: 'winner',
                maxScore: 3,
                chatEnable: true
            };

            const params2 = {
                playerID: 'loser'
            };

            let firstConnected = false;
            let client2Ready = false;


            client.on('roomEntered', object => {
                if (!firstConnected) {
                    firstConnected = true;
                    roomID = object.roomID;
                    params2.roomID = object.roomID;
                    client2.emit('knockToRoom', params2);
                } else {
                    done();
                }
            });

            client.emit('createNewRoom', params1);


            client2 = io.connect(socketAddr, socketOptions);
            client2.on('connect', () => client2Ready = true);
        });

        afterEach(function () {
            client.emit('forceDisconnect');
            client2.emit('forceDisconnect');
            // fromServer.close();
            client = client2 = null;
        });


        it('emitting gesture from client1 without arguments should cause an error emitted back', function (done) {
            client.on('myError', function () {
                done();
            });

            client.emit('playerDidTurn');
        });

        it('emitting gesture from client2 without arguments should cause an error emitted back', function (done) {
            client2.on('myError', function () {
                done();
            });

            client2.emit('playerDidTurn');
        });

        it('emitting gesture twice should cause an error emitted back', function (done) {
            const params = {
                gesture: 'rock'
            };

            client2.on('myError', function () {
                done();
            });

            client2.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params);
        });

        it('emitting gesture should emit back to client only 1 message', function (done) {
            const params = {
                gesture: 'rock'
            };

            client2.on('message', function () {
                done();
            });

            client2.emit('playerDidTurn', params);
        });

        it('emitting gesture should emit back to another player only 1 message', function (done) {
            const params = {
                gesture: 'rock'
            };

            client.on('message', function () {
                done()
            });

            client2.emit('playerDidTurn', params);
        });

        it('emitting gesture should emit message with object back to player', function (done) {
            const params = {
                gesture: 'rock'
            };

            client2.on('message', function (object) {
                expect(object).to.have.keys('type', 'gesture');
                done();
            });

            client2.emit('playerDidTurn', params);
        });

        it('emitting gesture should emit message with object back to opponent', function (done) {
            const params = {
                gesture: 'rock'
            };

            client.on('message', function (object) {
                expect(object).to.have.keys('type', 'gesture', 'playerID');
                done();
            });

            client2.emit('playerDidTurn', params);
        });

        it('emitting gesture should write in global room object', function (done) {
            const params = {
                gesture: 'rock'
            };

            client2.on('message', function () {
                expect(fromServer.rooms[roomID].players.loser.gesture).to.be.equal('rock');
                done();
            });

            client2.emit('playerDidTurn', params);
        });

        it('after both players did turn, matchResult event with winnerID should be emitted from server', function (done) {
            const params = {
                gesture: 'rock'
            };

            const params2 = {
                gesture: 'scissors'
            };

            client2.on('matchResult', function (object) {
                expect(object).to.be.equal('winner');
                done();
            });

            client.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params2);
        });

        it('after both players did turn, players gestures should be nulled', function (done) {
            const params = {
                gesture: 'rock'
            };

            const params2 = {
                gesture: 'scissors'
            };

            client2.on('matchResult', function () {
                for (const id in fromServer.rooms[roomID].players) {
                    if (fromServer.rooms[roomID].players[id].gesture) {
                        throw new Error('player gesture is still defined');
                    }
                }
                done();
            });

            client.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params2);
        });

        it('after some player win match, room matchesPlayed counter should be increased', function (done) {
            const params = {
                gesture: 'rock'
            };

            const params2 = {
                gesture: 'scissors'
            };

            client2.on('matchResult', function () {
                expect(fromServer.rooms[roomID].matchesPlayed).to.be.equal(1);
                done();
            });

            client.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params2);
        });

        it('if players did same turns, false should be emitted back', function (done) {
            const params = {
                gesture: 'rock'
            };

            const params2 = {
                gesture: 'rock'
            };

            client2.on('matchResult', function (object) {
                expect(object).to.be.equal(false);
                done();
            });

            client.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params2);
        });

        it('if players did same turns, room matchesPlayed counter should not be increased', function (done) {
            const params = {
                gesture: 'rock'
            };

            const params2 = {
                gesture: 'rock'
            };

            client2.on('matchResult', function () {
                expect(fromServer.rooms[roomID].matchesPlayed).to.be.equal(0);
                done();
            });

            client.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params2);
        });

        it('after N matches game should end with gameResult event emitted, object should be winnerID', function (done) {
            const params = {
                gesture: 'rock'
            };

            const params2 = {
                gesture: 'scissors'
            };

            let counter = 0;

            client2.on('gameResult', function (object) {
                expect(object).to.be.equal('winner');
                done();
            });

            client2.on('matchResult', function () {
                if (counter < 2) {
                    counter++;
                    client.emit('playerDidTurn', params);
                    client2.emit('playerDidTurn', params2);
                }
            });

            client.emit('playerDidTurn', params);
            client2.emit('playerDidTurn', params2);
        });

    });


    describe('Chat socket event test', function () {
        var client2;
        var roomID = '';

        beforeEach(function (done) {
            const params1 = {
                playerID: 'winner',
                maxScore: 3,
                chatEnable: true
            };

            const params2 = {
                playerID: 'loser'
            };

            let firstConnected = false;
            let client2Ready = false;


            client.on('roomEntered', object => {
                if (!firstConnected) {
                    firstConnected = true;
                    roomID = object.roomID;
                    params2.roomID = object.roomID;
                    client2.emit('knockToRoom', params2);
                } else {
                    done();
                }
            });

            client.emit('createNewRoom', params1);


            client2 = io.connect(socketAddr, socketOptions);
            client2.on('connect', () => client2Ready = true);
        });

        afterEach(function () {
            client.emit('forceDisconnect');
            client2.emit('forceDisconnect');
            client = client2 = null;
        });


        it('emitting chat message should cause emitting responce back', function (done) {
            client.on('chatMessage', function (object) {
                expect(object).to.have.keys('message', 'playerID');
                done();
            });

            client.emit('chatMessage', {message: 'hello'});
        });

        it('object from chat should contain correct playerID', function (done) {
            client.on('chatMessage', function (object) {
                expect(object.playerID).to.be.equal('winner');
                done();
            });

            client.emit('chatMessage', {message: 'hello'});
        });

        it('both players should receive the message', function (done) {
            const p1 = new Promise(resolve => {
                client.on('chatMessage', function (object) {
                    resolve();
                });
            });

            const p2 = new Promise(resolve => {
                client2.on('chatMessage', function (object) {
                    resolve();
                });
            });

            Promise.all([p1, p2])
                .then(() => done());

            client.emit('chatMessage', {message: 'hello'});
        });
    });


    describe('api/hello test', function () {
        it('should receive responce', function (done) {
            chai.request(socketAddr)
                .get('/api/hello')
                .end(function (err, res) {
                    expect(res.body).to.be.eql({express: 'Hello From Express'});
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        });
    })
});

































