describe('canary tests', () => {
  test('is true true?', () => {
    expect(true).toBe(true);
  })

  test('true should not be false', () => {
    expect(true).not.toBe(false)
  })
})