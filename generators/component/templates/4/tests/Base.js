import React from 'react';
import { shallow } from 'enzyme';
import * as styles from './<%= component.styleFileName %>';

describe('<<%= component.componentName %> />', function () {

  let component;
  beforeEach(function () {
    component = shallow(<<%= component.componentName %> />);
  });

  describe('when rendering the component', function () {

    it('should have a className of "<%= style.className %>"', function () {
      expect(component.hasClass('<%= style.className %>')).to.equal(true);
    });
  });
});
