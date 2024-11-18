/* eslint-disable */

import * as React from 'react';
import { Resizable } from '../src';
import { storiesOf } from '@storybook/react';
import { style } from './style';

storiesOf('vw vh', module)
  .add('vw', () => (
    <Resizable className="rectstyle" defaultSize={{ width: '50vw', height: '50vw' }}>
      001
    </Resizable>
  ))
  .add('vh', () => (
    <Resizable className="rectstyle" defaultSize={{ width: '50vh', height: '50vh' }}>
      001
    </Resizable>
  ));
