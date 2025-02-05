import React from 'react';
import renderer from 'react-test-renderer';
import ListBoxPortal from '../ListBoxPortal';
import * as ListBoxInlineModule from '../ListBoxInline';
import * as useObjectSelectionsMockModule from '../../../hooks/useObjectSelections';
import * as useExistingModelModule from '../hooks/useExistingModel';
import * as useOnTheFlyModelMockModule from '../hooks/useOnTheFlyModel';

jest.mock('react-dom', () => ({
  createPortal: (element) => element,
}));

describe('ListBoxPortal', () => {
  let testRenderer;
  let ListBoxInlineMock;
  let useObjectSelectionsMock;
  let useExistingModel;
  let useOnTheFlyModelMock;

  async function render(content) {
    await renderer.act(async () => {
      testRenderer = renderer.create(content);
    });
    return testRenderer;
  }

  beforeEach(() => {
    jest.useFakeTimers();

    ListBoxInlineMock = jest.fn().mockImplementation(({ options }) => <div>{options.model.id}</div>);
    useObjectSelectionsMock = jest.fn().mockReturnValue([{ id: 'objectSelection' }]);
    useExistingModel = jest.fn().mockReturnValue({});
    useOnTheFlyModelMock = jest.fn().mockReturnValue({});

    jest.spyOn(ListBoxInlineModule, 'default').mockImplementation(ListBoxInlineMock);
    jest.spyOn(useObjectSelectionsMockModule, 'default').mockImplementation(useObjectSelectionsMock);
    jest.spyOn(useExistingModelModule, 'default').mockImplementation(useExistingModel);
    jest.spyOn(useOnTheFlyModelMockModule, 'default').mockImplementation(useOnTheFlyModelMock);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('existing generic object', () => {
    test('should get object from app and use as model', async () => {
      const qId = '1337';
      const app = {};
      const elem = ListBoxPortal({ app, qId });
      await render(elem);
      expect(useExistingModel).toHaveBeenCalledWith({ app, qId, options: {} });
    });

    test('should use provided "sessionModel"', async () => {
      const app = {};
      const options = { sessionModel: {} };
      const elem = ListBoxPortal({ app, options });
      await render(elem);
      expect(useExistingModel).toHaveBeenCalledWith({
        app,
        options: { sessionModel: options.sessionModel },
        qId: undefined,
      });
    });
  });

  describe('on the fly', () => {
    test('should create session model when providing field name', async () => {
      const fieldIdentifier = 'Alpha';
      const app = {};
      const elem = ListBoxPortal({ app, fieldIdentifier });
      await render(elem);
      expect(useOnTheFlyModelMock).toHaveBeenCalledWith({ app, fieldIdentifier, stateName: '$', options: {} });
    });

    test('should create session model when providing qLibraryId', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const elem = ListBoxPortal({ app, fieldIdentifier });
      await render(elem);
      expect(useOnTheFlyModelMock).toHaveBeenCalledWith({ app, fieldIdentifier, stateName: '$', options: {} });
    });
  });

  describe('internal selections Api', () => {
    test('should get selections from useObjectSelections hook', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const options = { sessionModel: {} };
      const elementRef = {
        current: undefined,
      };
      const elem = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(useObjectSelectionsMock).toHaveBeenCalledWith(app, options.sessionModel, elementRef);
    });
  });

  describe('external selections Api', () => {
    test('should pass in provided selectionApi as "selections" into ListBoxInline', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const options = { selectionsApi: {}, sessionModel: {} };
      const elem = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(ListBoxInlineMock).toHaveBeenCalledWith(
        {
          options: {
            ...options,
            selections: options.selectionsApi,
            model: options.sessionModel,
          },
        },
        {}
      );
    });
  });
});
