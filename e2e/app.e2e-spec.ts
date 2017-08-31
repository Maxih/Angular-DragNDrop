import { NgDynamicTestPage } from './app.po';

describe('ng-dynamic-test App', () => {
  let page: NgDynamicTestPage;

  beforeEach(() => {
    page = new NgDynamicTestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
