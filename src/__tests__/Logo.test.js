import React from 'react';
import ReactDOM from 'react-dom';
import Logo from '../components/Logo';
import { shallow, mount } from 'enzyme';


describe('Logo component test', function () {
    let wrapper;
    
    beforeAll(() => {
        wrapper = mount(<Logo />);
    });

    it('Logo should contain svg', function () {
        setTimeout(() => {
            wrapper.update();
            expect(wrapper.find('logo').length).toBe(1);
        }, 1000)
    });
});