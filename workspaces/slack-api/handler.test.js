const handler = require("./handler")

const failedResponse = {
  statusCode: 400,
  body: JSON.stringify({
    message: `Had an issue trying to post into conversation.`,
  }),
}

test('canary testing', () => {
  expect(true).toBe(true);
});

test('rejects to canary', async () => {
  await expect(Promise.reject(new Error('canary'))).rejects.toThrow('canary');
});

// test('no token parameter passed in returns an Error', async () => {
//   await expect(handler.postToSlack('someChannel', 'Hi, Mom!', null))
//   .rejects
//   .toThrow('not_authed');
// });
