if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
    global.TextDecoder = require('util').TextDecoder;
  }

  require('@testing-library/jest-dom');
