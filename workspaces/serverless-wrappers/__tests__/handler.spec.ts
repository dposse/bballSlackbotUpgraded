// import { runBot } from '../handler';

describe('canary tests', () => {
  test('is true true?', () => {
    expect(true).toBe(true);
  })

  test('true should not be false', () => {
    expect(true).not.toBe(false)
  })
})

describe('handler.runBot tests', () => {
  describe('happy path', () => {
    test('returns a proper serialized json, statusCode 200', () => {
      // const runBotResponse = JSON.parse(runBot());
      // expect(runBotResponse).toBeDefined();
      // expect(runBotResponse.statusCode).toBe(200);
    })
  })

  describe('sad path', () => {

  })
})