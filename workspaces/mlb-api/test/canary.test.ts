describe('canary tests - on initial install change these so they break', () => {
  it('true is true', () => {
    expect(true).toEqual(true);
  });
  test('true is not false', () => {
    expect(true).not.toBe(false);
  })
});
