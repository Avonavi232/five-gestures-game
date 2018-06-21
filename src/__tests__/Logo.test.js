import React from 'react';
import ReactDOM from 'react-dom';
import Logo from '../components/Logo';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import A from '../assets/snap.svg-min'; //important!

configure({ adapter: new Adapter() });

class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        delete this.store[key];
    }
};
global.localStorage = new LocalStorageMock;


it('renders without crashing', function () {
    const div = document.createElement('div');
    ReactDOM.render(<Logo />, div);
});