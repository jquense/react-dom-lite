let windowErrors;

beforeEach(() => {
  windowErrors = [];
  // jsdom is swallowing errors in event handlers
  window.onerror = err => {
    windowErrors.push(err);
  };
});

afterEach(() => {
  if (windowErrors.length) throw windowErrors.pop();
});
