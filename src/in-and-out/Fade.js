/*
 * Fade React Component
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { bool, number, string, shape } from 'prop-types';
import { animation, defaults } from '../lib/globals';
import wrap from '../lib/wrap';

const
  propTypes = {
    out: bool,
    left: bool,
    right: bool,
    top: bool,
    bottom: bool,
    big: bool,
    mirror: bool,
    opposite: bool,
    duration: number,
    timeout: number,
    distance: string,
    delay: number,
    count: number,
    forever: bool,
    easing: string,
    effectPerCascade: bool,
    custom: shape({
      from: shape(),
      to: shape()
    })
  };

const camelCaseToDash = myStr => {
    return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

const cssStringify = (obj) => {
  let css = '';
  Object.keys(obj).forEach(key => css += `${camelCaseToDash(key)}: ${obj[key]}; `);
  return css;
}

const lookup = {};
function make(reverse, { distance, left, right, up, down, top, bottom, big, mirror, opposite, easing, custom, }) {
  const checksum = (distance?distance.toString():0) + ( (left?1:0) | (right?2:0) | (top||down?4:0) | (bottom||up?8:0) | (mirror?16:0) | (opposite?32:0) | (reverse?64:0) | (big?128:0));
  if (lookup.hasOwnProperty(checksum))
    return lookup[checksum];

  const transform = left||right||up||down||top||bottom;

  let x, y;
  if (transform) {
    if ( !mirror !== !(reverse&&opposite)) // Boolean XOR
      [left, right, top, bottom, up, down] = [right, left, bottom, top, down, up];
    const dist = distance || (big ? '2000px' : '100%');
    x = left ? '-' + dist : ( right ? dist : '0' );
    y = down || top ? '-'+ dist : ( up || bottom ? dist : '0' );
  }

  let animStart = '';
  let animEnd = '';
  if (custom && custom.from && custom.to) {
    animStart = cssStringify(!reverse ? custom.from : custom.to);
    animEnd = cssStringify(reverse ? custom.from : custom.to);
  }

  lookup[checksum] = animation(
    `${!reverse?'from':'to'} {${animStart} opacity: 0; ${ transform ? ` transform: translate3d(${x}, ${y}, 0);` : ''}}
     ${ reverse?'from':'to'} {${animEnd} opacity: 1; transform: none;} `
  );

  return lookup[checksum];
}

function Fade({ children, out, forever,
              timeout, easing = 'linear', custom = {}, duration = defaults.duration, delay = defaults.delay, count = defaults.count, ...props } = defaults, context = false) {
  const effect = {
    make,
    duration: timeout === undefined ? duration : timeout,
    delay,
    forever,
    count,
    style: {
      animationFillMode: 'both',
      animationTimingFunction: easing || 'linear',
    },
    reverse: props.left,
  };
  return context ? wrap(props, effect, effect, children) : effect;
}

Fade.propTypes = propTypes;
export default Fade;
