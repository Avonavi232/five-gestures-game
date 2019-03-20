import React, {createRef} from 'react';
import PropTypes from 'prop-types';

//Redux
import {connect} from 'react-redux';
import {getDeepProp} from "../utils/functions";

class GameBoard extends React.Component {
    constructor(props) {
        super(props);

        this.animSpeed = 200;

        this.playerGestureRef = createRef();
        this.opponentGestureRef = createRef();

        this.togglePlayerGesture = Function.prototype;
        this.toggleOpponentGesture = Function.prototype;
    }

    loadSvg = s => {
        const Snap = window.Snap;
        return new Promise((resolve) => {
            Snap.load(process.env.PUBLIC_URL + `/single-gestures.svg`, svg => {
                s.append(svg);
                const svgContainer = s.select('svg');
                svgContainer.attr({'height': ''});
                svgContainer.attr({'width': ''});
                resolve();
            });
        })
    };

    gestureFade = (s, gestureID, direction) => {
        return new Promise((resolve) => {
            const target = s.select(`#${gestureID}`);

            if (!target) {
                resolve();
                return;
            }

            let endOpacity = '';
            switch (direction) {
                case 'in':
                    endOpacity = 1;
                    break;
                case 'out':
                    endOpacity = 0;
                    break;
                default:
                    return;
            }

            target.animate(
                {
                    opacity: endOpacity
                },
                this.animSpeed,
                window.mina.linear,
                resolve
            )
        })
    };

    gestureToggle = snapSurface => {
        let animCompleted = true;
        const self = this;

        return function toggler(gestureID) {
            const all = Array.from(snapSurface.selectAll(`.item`));
            let toFadeOut = null;

            if (!animCompleted) {
                setTimeout(() => toggler(gestureID), 50);
                return;
            } else {
                animCompleted = false;
            }

            all.forEach(gesture => {
                if (gesture.attr('opacity') == 1) {
                    toFadeOut = gesture.attr('id');
                }
            });

            if (toFadeOut) {
                self.gestureFade(snapSurface, toFadeOut, 'out')
                    .then(() => {
                        self.gestureFade(snapSurface, gestureID, 'in')
                            .then(() => animCompleted = true);
                    });
            } else {
                self.gestureFade(snapSurface, gestureID, 'in')
                    .then(() => animCompleted = true);
            }
        }
    };

    componentDidMount() {
        const Snap = window.Snap;
        this.playerSvgSurface = Snap(this.playerGestureRef.current);
        this.opponentSvgSurface = Snap(this.opponentGestureRef.current);

        this.togglePlayerGesture = this.gestureToggle(this.playerSvgSurface);
        this.toggleOpponentGesture = this.gestureToggle(this.opponentSvgSurface);


        this.busy = Promise.all([
            this.loadSvg(this.playerSvgSurface),
            this.loadSvg(this.opponentSvgSurface)
        ])
    }

    componentDidUpdate(prevProps) {
        const {playerGesture, opponentGesture} = this.props;


        if (prevProps.playerGesture !== playerGesture) {
            this.togglePlayerGesture(playerGesture);
        }

        if (prevProps.opponentGesture !== opponentGesture || this.opponentGesture === 'question') {
            let gesture = (this.props.playerGesture || !opponentGesture) ?
                opponentGesture :
                'question';

            this.opponentGesture = gesture;
            this.toggleOpponentGesture(gesture);
        }
    }

    render() {
        return (
            <section id="game-board">
                <div className="game-board container">
                    <div className="game-board__your-gesture game-board__gesture">
                        <p className="game-board__gesture-title">Your gesture</p>
                        <div ref={this.playerGestureRef}/>
                    </div>
                    <div className="game-board__separator"/>
                    <div className="game-board__opponent-gesture game-board__gesture">
                        <p className="game-board__gesture-title">Opponent`s gesture</p>
                        <div ref={this.opponentGestureRef}/>
                    </div>
                </div>
            </section>
        )
    }
}

GameBoard.propTypes = {
    playerGesture: PropTypes.string,
    opponentGesture: PropTypes.string
};

const mapStateToProps = state => ({
    playerGesture: getDeepProp(state, 'status.playerMove'),
    opponentGesture: getDeepProp(state, 'status.opponentMove'),
});

export default connect(mapStateToProps)(GameBoard);