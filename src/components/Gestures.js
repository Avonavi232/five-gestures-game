import React from 'react';

//Redux
import {connect} from 'react-redux';
import {getDeepProp} from "../utils/functions";

class Gestures extends React.Component{
    defaultBgColor = {
        fill: '#eeeeee',
        stroke: '#cccccc'
    };

    hoverBgColor = {
        fill: '#66d7e5',
        stroke: '#00bcd4',
        cursor: 'pointer'
    };

    gestureHoverInHandler = item => {
        const itemBackground = item.select('.itemBackground');
        const arrows = item.select('.arrows');
        if (!itemBackground || !arrows) return;

        itemBackground.attr(this.hoverBgColor);
        arrows.attr({display: 'block'});
    };

    gestureHoverOutHandler = item => {
        const itemBackground = item.select('.itemBackground');
        const arrows = item.select('.arrows');
        if (!itemBackground || !arrows) return;

        itemBackground.attr(this.defaultBgColor);
        arrows.attr({display: 'none'});
    };

    gestureSubmitHandler = item => {
        const {playerMove, socket} = this.props;

        // !playerMove && socket.emit('makeMove', item.attr('id'));
        socket.emit('makeMove', item.attr('id'));
    };

    componentDidMount() {
        const Snap = window.Snap;
        const s = Snap(this.refs.svgContainer);

        Snap.load(process.env.PUBLIC_URL + '/game.svg', svg => {
            const items = svg.selectAll('.item');
            s.append(svg);
            items.forEach(item => {
                item.hover(() => this.gestureHoverInHandler(item), () => this.gestureHoverOutHandler(item));
                item.click(() => this.gestureSubmitHandler(item));
            })
        })
    }


    render(){
        return(
            <section className="gestures">
                <div className="container">
                    <div className="svgContainer" ref="svgContainer"/>
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => ({
    socket: getDeepProp(state, 'settings.socket'),
    playerMove: getDeepProp(state, 'status.playerMove')
});

export default connect(mapStateToProps)(Gestures);