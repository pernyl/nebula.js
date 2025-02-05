/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
/* eslint-disable array-callback-return */
/* eslint-disable import/first */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import * as unlockModule from '@nebula.js/ui/icons/unlock';
import * as lockModule from '@nebula.js/ui/icons/lock';

import ListBoxInline from '../ListBoxInline';
import * as InstanceContextModule from '../../../contexts/InstanceContext';
import * as useLayoutModule from '../../../hooks/useLayout';
import * as ActionsToolbarModule from '../../ActionsToolbar';
import * as ListBoxModule from '../ListBox';
import * as ListBoxSearchModule from '../components/ListBoxSearch';
import * as listboxSelectionToolbarModule from '../interactions/listbox-selection-toolbar';
import * as addListboxTheme from '../assets/addListboxTheme';

const virtualizedModule = require('react-virtualized-auto-sizer');
const listboxKeyboardNavigationModule = require('../interactions/listbox-keyboard-navigation');

jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../interactions/listbox-keyboard-navigation', () => ({
  __esModule: true,
  default: jest.fn(),
  getListboxInlineKeyboardNavigation: jest.fn(),
}));

describe('<ListboxInline />', () => {
  const app = { key: 'app' };
  const fieldIdentifier = { qLibraryId: 'qLibraryId' };
  const stateName = '$';

  let options;
  let useState;
  let useEffect;
  let useCallback;
  let useRef;
  let model;
  let ActionsToolbar;
  let ListBoxSearch;
  let createListboxSelectionToolbar;
  let layout;
  let selections;
  let renderer;
  let render;
  let getListboxInlineKeyboardNavigation;
  let InstanceContext;

  beforeEach(() => {
    useState = jest.fn();
    useEffect = jest.fn();
    useCallback = jest.fn();
    useRef = jest.fn();

    jest.spyOn(React, 'useState').mockImplementation(useState);
    jest.spyOn(React, 'useEffect').mockImplementation(useEffect);
    jest.spyOn(React, 'useCallback').mockImplementation(useCallback);
    jest.spyOn(React, 'useRef').mockImplementation(useRef);

    model = {
      key: 'model',
      lock: jest.fn(),
      unlock: jest.fn(),
    };

    ActionsToolbar = jest.fn().mockReturnValue('ActionsToolbar');
    ListBoxSearch = jest.fn().mockReturnValue('ListBoxSearch');
    getListboxInlineKeyboardNavigation = jest.fn().mockReturnValue('keyboard-navigation');
    createListboxSelectionToolbar = jest.fn().mockReturnValue('actions');
    layout = {
      title: 'title',

      qListObject: {
        qDimensionInfo: {
          qFallbackTitle: 'qFallbackTitle',
          qLocked: false,
          qStateCounts: { qSelected: 2, qSelectedExcluded: 10, qLocked: 0, qLockedExcluded: 0 },
        },
      },
    };

    InstanceContext = React.createContext();
    InstanceContextModule.default = InstanceContext;

    jest.spyOn(virtualizedModule, 'default').mockImplementation(() => <div data-testid="virtualized-auto-sizer" />);
    jest.spyOn(unlockModule, 'default').mockImplementation(() => 'unlock');
    jest.spyOn(lockModule, 'default').mockImplementation(() => 'lock');
    jest.spyOn(useLayoutModule, 'default').mockImplementation(() => [layout]);
    jest
      .spyOn(listboxKeyboardNavigationModule, 'getListboxInlineKeyboardNavigation')
      .mockImplementation(getListboxInlineKeyboardNavigation);
    jest.spyOn(addListboxTheme, 'default').mockImplementation(() => {});

    ActionsToolbarModule.default = ActionsToolbar;
    ListBoxModule.default = <div className="theListBox" />;
    ListBoxSearchModule.default = ListBoxSearch;
    listboxSelectionToolbarModule.default = createListboxSelectionToolbar;

    selections = {
      key: 'selections',
      isModal: jest.fn().mockReturnValue(false),
      isActive: () => 'isActive',
      on: jest.fn().mockImplementation((event, func) => (eventTriggered) => {
        if (event === eventTriggered) func();
      }),
      off: jest.fn(),
    };

    options = {
      title: 'title',
      direction: 'vertical',
      listLayout: 'vertical',
      search: true,
      focusSearch: false,
      toolbar: true,
      properties: {},
      model,
      selections,
      update: undefined,
      fetchStart: 'fetchStart',
    };

    useRef.mockReturnValue({ current: 'current' });
    useState.mockImplementation((startValue) => [startValue, () => {}]);

    useEffect
      .mockImplementationOnce((effectFunc, watchArr) => {
        expect(watchArr[1].key).toBe('selections');
        effectFunc();
      })
      .mockImplementationOnce((effectFunc) => {
        effectFunc();
      });

    useCallback
      .mockImplementationOnce((effectFunc, watchArr) => {
        expect(watchArr[1].key).toBe('model');
        return effectFunc;
      })
      .mockImplementationOnce((effectFunc, watchArr) => {
        expect(watchArr[1].key).toBe('model');
        return effectFunc;
      });
  });

  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('Check rendering with different options', () => {
    beforeEach(() => {
      const theme = createTheme('dark');

      render = async () => {
        await act(async () => {
          renderer = create(
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <ListBoxInline app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} />
              </InstanceContext.Provider>
            </ThemeProvider>
          );
        });
      };
    });

    test('should render with everything included', async () => {
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).toBe(1);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).toBe(1);

      const autoSizers = renderer.root.findAllByProps({ 'data-testid': 'virtualized-auto-sizer' });
      expect(autoSizers.length).toBe(1);

      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches.length).toBe(1);
      const showSearchButtons = renderer.root.findAllByType(IconButton);
      expect(showSearchButtons.length).toBe(1);
      expect(getListboxInlineKeyboardNavigation).toHaveBeenCalledTimes(2);

      // TODO: MUIv5
      // expect(renderer.toJSON().props.onKeyDown).toBe('keyboard-navigation');

      expect(selections.on).toHaveBeenCalledTimes(2);
      expect(selections.on.mock.calls[0][0]).toBe('deactivated');
      expect(selections.on.mock.calls[1][0]).toBe('activated');
      expect(selections.off).not.toHaveBeenCalled();
    });

    test('should render without toolbar', async () => {
      options.toolbar = false;
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).toBe(0);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).toBe(0);

      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches.length).toBe(1);
    });

    test('should render without toolbar', async () => {
      options.search = 'toggle';
      await render();

      ListBoxSearch.mock.calls
        .map((x) => x[0])
        .map((callArgs) => {
          expect(callArgs).toMatchObject({
            visible: false,
          });
        });
      expect(selections.on).toHaveBeenCalledTimes(2);
      expect(selections.isModal).toHaveBeenCalledTimes(1);
      expect(selections.on.mock.calls[0][0]).toBe('deactivated');
      expect(selections.on.mock.calls[1][0]).toBe('activated');
    });

    test('should render without search and show search button', async () => {
      options.search = false;
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).toBe(1);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).toBe(1);

      ListBoxSearch.mock.calls
        .map((x) => x[0])
        .map((callArgs) => {
          expect(callArgs).toMatchObject({
            visible: false,
          });
        });
    });
  });
});
