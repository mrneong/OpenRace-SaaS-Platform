const { runV2CommunityFeaturesTests } = require('./workspace/backend/dist/application/use-cases/v2-community-features.spec.js');

const runner = {
  suite(name, fn) {
    console.log('Suite:', name);
    fn();
  },
  test(name, fn) {
    try {
      fn();
      console.log('  PASS:', name);
    } catch (e) {
      console.error('  FAIL:', name, e);
    }
  },
  expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
      },
      toBeDefined() {
        if (actual === undefined || actual === null) throw new Error(`Expected defined but got ${actual}`);
      }
    };
  }
};

runV2CommunityFeaturesTests(runner);
