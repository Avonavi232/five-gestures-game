import React from 'react';
import PropTypes from 'prop-types';

class GameBoard extends React.Component{
    loadSvg = (s, svgName) => {
        const Snap = window.Snap;
        const oldSvg = s.select('svg');
        const oldSvgChildren = oldSvg ? oldSvg.children() : null;

        if (oldSvgChildren) {
            oldSvgChildren.forEach(el => el.remove());
        }

        Snap.load(process.env.PUBLIC_URL + `/${svgName}.svg`, svg => {
            if (oldSvg) {
                oldSvg.append(svg);
            } else {
                s.append(svg);
            }

        });
    };

    componentDidMount() {
        const Snap = window.Snap;
        this.yourS = Snap(this.refs['your-gesture']);
        this.opponentS = Snap(this.refs['opponents-gesture']);
    }

    componentDidUpdate() {
        this.loadSvg(this.yourS, this.props.your);
        this.loadSvg(this.opponentS, this.props.opponents);
    }


    render(){
        return(
            <section id="game-board">
                <div className="game-board container">
                    <div className="game-board__your-gesture game-board__gesture">
                        <p className="game-board__gesture-title">Your gesture</p>
                        <div ref="your-gesture" />
                    </div>
                    <div className="game-board__separator"></div>
                    <div className="game-board__opponent-gesture game-board__gesture">
                        <p className="game-board__gesture-title">Opponent`s gesture</p>
                        <div ref="opponents-gesture" />
                    </div>
                </div>
            </section>
        )
    }
}

GameBoard.defaultProps = {
    your: 'question',
    opponents: 'question'
};

GameBoard.propTypes = {
    your: PropTypes.string.isRequired,
    opponents: PropTypes.string.isRequired
};

export default GameBoard;