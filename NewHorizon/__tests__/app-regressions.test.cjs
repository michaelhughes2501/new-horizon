// Uses Node's built-in runner and dependencies already in the Expo lockfile.
// After installing the app dependencies, run from NewHorizon/:
// node --test __tests__/app-regressions.test.cjs
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { describe, it, mock } = require('node:test');
const { Script } = require('node:vm');
const { transformSync } = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const appRoot = path.resolve(__dirname, '..');
const compiledModules = new Map();

// Keep real React rendering, hooks, context, and application modules. Replace
// only native/navigation boundaries so these unit tests need no device, DOM,
// backend, or additional test dependencies. Each harness owns its module cache
// and fixtures; loading a screen never changes Node's global require hooks.
function createHarness({ data = {}, focused = true } = {}) {
  const modules = new Map();
  const nodes = [];
  const focusCallbacks = [];
  const setStatusBarStyle = mock.fn();

  function nativeComponent(type) {
    return function NativeComponent(props) {
      nodes.push({ type, props });
      return React.createElement(type === 'Text' ? 'span' : React.Fragment, null, props.children);
    };
  }

  function listComponent(component) {
    return typeof component === 'function' ? React.createElement(component) : component;
  }

  const stubs = {
    'react-native': {
      View: nativeComponent('View'),
      Text: nativeComponent('Text'),
      ScrollView: nativeComponent('ScrollView'),
      Pressable: nativeComponent('Pressable'),
      StyleSheet: { create: (styles) => styles },
      Alert: { alert: mock.fn() },
      FlatList: (props) => {
        nodes.push({ type: 'FlatList', props });
        return React.createElement(React.Fragment, null,
          listComponent(props.ListHeaderComponent),
          props.data.length === 0
            ? listComponent(props.ListEmptyComponent)
            : props.data.map((item, index) => React.createElement(React.Fragment,
              { key: props.keyExtractor(item, index) }, props.renderItem({ item, index }))),
        );
      },
    },
    '@react-navigation/native': {
      DefaultTheme: { colors: {} },
      NavigationContainer: nativeComponent('NavigationContainer'),
      useIsFocused: () => focused,
      // Rendering registers callbacks. Tests explicitly deliver a focus event;
      // server rendering alone does not execute React effects.
      useFocusEffect: (callback) => focusCallbacks.push(callback),
    },
    '@react-navigation/bottom-tabs': {
      createBottomTabNavigator: () => ({
        Navigator: nativeComponent('Navigator'),
        Screen: (props) => {
          nodes.push({ type: 'Screen', props });
          return React.createElement(props.component);
        },
      }),
    },
    'react-native-safe-area-context': {
      SafeAreaProvider: nativeComponent('SafeAreaProvider'),
      useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    },
    'react-native-gesture-handler': {
      GestureHandlerRootView: nativeComponent('GestureHandlerRootView'),
    },
    '@expo/vector-icons': { Ionicons: nativeComponent('Ionicons') },
    'expo-status-bar': { StatusBar: nativeComponent('StatusBar'), setStatusBarStyle },
  };

  function load(filename) {
    const absolute = path.resolve(appRoot, filename);
    if (absolute === path.join(appRoot, 'lib/supabase.ts')) {
      return { BACKEND_READY: false };
    }
    if (modules.has(absolute)) return modules.get(absolute).exports;

    if (!compiledModules.has(absolute)) {
      const { code } = transformSync(readFileSync(absolute, 'utf8'), {
        filename: absolute,
        babelrc: false,
        configFile: false,
        presets: [[require.resolve('babel-preset-expo'), { jsxRuntime: 'classic' }]],
        plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
      });
      compiledModules.set(absolute, new Script(
        `(function(require, module, exports) {\n${code}\n})`, { filename: absolute },
      ).runInThisContext());
    }

    const module = { exports: {} };
    modules.set(absolute, module);
    const localRequire = (specifier) => {
      if (Object.hasOwn(stubs, specifier)) return stubs[specifier];
      if (!specifier.startsWith('.')) return require(specifier);
      const base = path.resolve(path.dirname(absolute), specifier);
      const resolved = [base, `${base}.tsx`, `${base}.ts`, `${base}.js`].find(existsSync);
      assert.ok(resolved, `Cannot resolve ${specifier} from ${absolute}`);
      return load(resolved);
    };
    compiledModules.get(absolute)(localRequire, module, module.exports);
    if (absolute === path.join(appRoot, 'lib/demoData.ts')) {
      module.exports = { ...module.exports, ...data };
    }
    return module.exports;
  }

  function textContent(children) {
    return React.Children.toArray(children).map((child) => (
      React.isValidElement(child) ? textContent(child.props.children) : String(child)
    )).join('');
  }

  function render(element) {
    nodes.length = 0;
    focusCallbacks.length = 0;
    renderToStaticMarkup(element);
    return {
      ofType: (type) => nodes.filter((node) => node.type === type).map((node) => node.props),
      texts: nodes.filter((node) => node.type === 'Text')
        .map((node) => textContent(node.props.children)),
    };
  }

  return {
    load,
    render,
    focus: () => focusCallbacks.forEach((callback) => callback()),
    setStatusBarStyle,
  };
}

const post = Object.freeze({
  id: 'post-1', author: 'Test Author', initials: 'TA', time: '1m',
  body: 'A community update', likes: 0, comments: 0, tag: 'Milestone',
});
const unreadNotification = Object.freeze({
  id: 'unread-1', icon: '🤝', title: 'New connection',
  detail: 'Someone connected with you', time: '1m', unread: true,
});
const readNotification = Object.freeze({
  id: 'read-1', icon: '📅', title: 'Reminder',
  detail: 'Your appointment is tomorrow', time: '1d', unread: false,
});

function renderNotifications(harness, { readIds = [], markRead = mock.fn() } = {}) {
  const Screen = harness.load('screens/NotificationsScreen.tsx').default;
  const { NotificationsContext } = harness.load('lib/notificationsContext.ts');
  return harness.render(React.createElement(NotificationsContext.Provider, {
    value: { hasRead: (id) => readIds.includes(id), markRead },
  }, React.createElement(Screen)));
}

describe('EmptyState', () => {
  it('renders the default icon and required title without a detail node', () => {
    const harness = createHarness();
    const { EmptyState } = harness.load('components/EmptyState.tsx');
    const view = harness.render(React.createElement(EmptyState, { title: 'Nothing here yet' }));
    assert.deepEqual(view.texts, ['✦', 'Nothing here yet']);
  });

  it('renders a custom icon and detail exactly once', () => {
    const harness = createHarness();
    const { EmptyState } = harness.load('components/EmptyState.tsx');
    const view = harness.render(React.createElement(EmptyState, {
      icon: '🔔', title: 'No alerts', detail: 'Come back soon.',
    }));
    assert.deepEqual(view.texts, ['🔔', 'No alerts', 'Come back soon.']);
  });

  it('omits an explicitly empty detail rather than rendering a blank text node', () => {
    const harness = createHarness();
    const { EmptyState } = harness.load('components/EmptyState.tsx');
    const view = harness.render(React.createElement(EmptyState, { title: 'No alerts', detail: '' }));
    assert.deepEqual(view.texts, ['✦', 'No alerts']);
  });

  it('preserves an explicitly empty icon instead of replacing it with the default', () => {
    const harness = createHarness();
    const { EmptyState } = harness.load('components/EmptyState.tsx');
    const view = harness.render(React.createElement(EmptyState, { title: 'No alerts', icon: '' }));
    assert.deepEqual(view.texts, ['', 'No alerts']);
  });

  it('renders punctuation, Unicode, and markup-like text as content', () => {
    const harness = createHarness();
    const { EmptyState } = harness.load('components/EmptyState.tsx');
    const view = harness.render(React.createElement(EmptyState, {
      title: '<No posts> & updates', detail: "We'll let you know — soon ✦",
    }));
    assert.deepEqual(view.texts, ['✦', '<No posts> & updates', "We'll let you know — soon ✦"]);
  });
});

describe('FeedScreen empty state', () => {
  it('shows the empty message and keeps the feed header when there are no posts', () => {
    const harness = createHarness({ data: { FEED: [] } });
    const FeedScreen = harness.load('screens/FeedScreen.tsx').default;
    const view = harness.render(React.createElement(FeedScreen));
    assert.ok(view.texts.includes('The Yard'));
    assert.ok(view.texts.includes('What the community is sharing today'));
    assert.ok(view.texts.includes('👥'));
    assert.ok(view.texts.includes('The Yard is quiet right now'));
    assert.ok(view.texts.includes('Check back soon — new posts from the community will show up here.'));
    assert.equal(view.ofType('Pressable').length, 0);
  });

  for (const count of [1, 2]) {
    it(`renders ${count} post(s) without the empty message`, () => {
      const posts = Array.from({ length: count }, (_, index) => ({
        ...post, id: `post-${index}`, body: `Community update ${index}`,
      }));
      const harness = createHarness({ data: { FEED: posts } });
      const FeedScreen = harness.load('screens/FeedScreen.tsx').default;
      const view = harness.render(React.createElement(FeedScreen));
      for (const item of posts) assert.ok(view.texts.includes(item.body));
      assert.ok(!view.texts.includes('The Yard is quiet right now'));
      const [list] = view.ofType('FlatList');
      assert.deepEqual(list.data.map(list.keyExtractor), posts.map((item) => item.id));
    });
  }
});

describe('NotificationsScreen', () => {
  it('still requires a provider, including when there are no notifications', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [] } });
    const Screen = harness.load('screens/NotificationsScreen.tsx').default;
    assert.throws(() => harness.render(React.createElement(Screen)), {
      message: 'NotificationsScreen must be rendered within NotificationsContext.Provider',
    });
  });

  it('shows the empty message without a badge or notification buttons', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [] } });
    const markRead = mock.fn();
    const view = renderNotifications(harness, { markRead });
    assert.deepEqual(view.texts, [
      'Notifications', '🔔', 'No notifications yet',
      "We'll let you know here when there's something new — connections, job matches, and reminders.",
    ]);
    assert.equal(view.ofType('Pressable').length, 0);
    assert.equal(markRead.mock.calls.length, 0);
  });

  it('keeps read notifications visible instead of treating zero unread as an empty list', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [readNotification] } });
    const view = renderNotifications(harness);
    assert.ok(view.texts.includes(readNotification.title));
    assert.ok(view.texts.includes(readNotification.detail));
    assert.ok(!view.texts.includes('No notifications yet'));
    assert.ok(!view.texts.some((text) => /^\d+ new$/.test(text)));
    assert.equal(view.ofType('Pressable').length, 1);
    assert.equal(view.ofType('Pressable')[0].accessibilityLabel,
      `${readNotification.title}. ${readNotification.detail}`);
  });

  it('renders mixed read/unread rows and counts only unread notifications', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [unreadNotification, readNotification] } });
    const view = renderNotifications(harness);
    assert.ok(view.texts.includes('1 new'));
    assert.ok(!view.texts.includes('No notifications yet'));
    assert.deepEqual(view.ofType('Pressable').map((row) => row.accessibilityLabel), [
      `${unreadNotification.title}. ${unreadNotification.detail}. Unread`,
      `${readNotification.title}. ${readNotification.detail}`,
    ]);
  });

  it('keeps the list visible after every unread notification has been marked read', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [unreadNotification] } });
    const view = renderNotifications(harness, { readIds: [unreadNotification.id] });
    assert.ok(!view.texts.includes('No notifications yet'));
    assert.ok(!view.texts.includes('1 new'));
    assert.equal(view.ofType('Pressable')[0].accessibilityLabel,
      `${unreadNotification.title}. ${unreadNotification.detail}`);
  });

  it('marks only the pressed notification read through the provided context', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [unreadNotification, readNotification] } });
    const markRead = mock.fn();
    const view = renderNotifications(harness, { markRead });
    assert.equal(markRead.mock.calls.length, 0);
    view.ofType('Pressable')[0].onPress();
    assert.deepEqual(markRead.mock.calls.map((call) => call.arguments), [[unreadNotification.id]]);
  });

  for (const notifications of [[], [unreadNotification]]) {
    it(`sets dark status bar icons once per focus with ${notifications.length} notification(s)`, () => {
      const harness = createHarness({ data: { NOTIFICATIONS: notifications } });
      const view = renderNotifications(harness);
      assert.deepEqual(view.ofType('StatusBar').map((bar) => bar.style), ['dark']);
      assert.equal(harness.setStatusBarStyle.mock.calls.length, 0);
      harness.focus();
      assert.deepEqual(harness.setStatusBarStyle.mock.calls.map((call) => call.arguments), [['dark']]);
    });
  }

  it('does not render a declarative status bar when the tab is unfocused', () => {
    const harness = createHarness({ data: { NOTIFICATIONS: [] }, focused: false });
    const view = renderNotifications(harness);
    assert.equal(view.ofType('StatusBar').length, 0);
    assert.equal(harness.setStatusBarStyle.mock.calls.length, 0);
  });
});

describe('App navigation regression', () => {
  it('mounts one navigation tree with all four real screens inside the notifications provider', () => {
    const harness = createHarness();
    const App = harness.load('App.tsx').default;
    // Rendering the real NotificationsScreen also verifies that its required
    // context is available; the old duplicate tree throws here.
    const view = harness.render(React.createElement(App));
    assert.equal(view.ofType('GestureHandlerRootView').length, 1);
    assert.equal(view.ofType('SafeAreaProvider').length, 1);
    assert.equal(view.ofType('NavigationContainer').length, 1);
    assert.equal(view.ofType('Navigator').length, 1);
    assert.deepEqual(view.ofType('Screen').map((screen) => screen.name), [
      'Home', 'Feed', 'Notifications', 'Profile',
    ]);
    assert.equal(view.ofType('Screen').find((screen) => screen.name === 'Feed').options.tabBarLabel,
      'The Yard');
  });

  it('renders the imported root status bar even when no tab is focused', () => {
    const harness = createHarness({ focused: false });
    const App = harness.load('App.tsx').default;
    const view = harness.render(React.createElement(App));
    assert.deepEqual(view.ofType('StatusBar').map((bar) => bar.style), ['light']);
  });

  for (const notifications of [[], [readNotification], [unreadNotification, readNotification]]) {
    it(`uses the shared unread count for the Alerts badge with ${notifications.length} notification(s)`, () => {
      const harness = createHarness({ data: { NOTIFICATIONS: notifications } });
      const App = harness.load('App.tsx').default;
      const view = harness.render(React.createElement(App));
      const screens = view.ofType('Screen').filter((screen) => screen.name === 'Notifications');
      assert.equal(screens.length, 1);
      assert.equal(screens[0].options.tabBarLabel, 'Alerts');
      assert.equal(screens[0].options.tabBarBadge,
        notifications.filter((notification) => notification.unread).length || undefined);
    });
  }
});

describe('HomeScreen and ProfileScreen import regressions', () => {
  for (const [screen, heading] of [['HomeScreen', 'Good morning,'], ['ProfileScreen', 'Marcus Johnson']]) {
    it(`${screen} compiles, renders, and sets light status bar icons on focus`, () => {
      const harness = createHarness();
      const Screen = harness.load(`screens/${screen}.tsx`).default;
      const view = harness.render(React.createElement(Screen));
      assert.ok(view.texts.includes(heading));
      assert.deepEqual(view.ofType('StatusBar').map((bar) => bar.style), ['light']);
      harness.focus();
      assert.deepEqual(harness.setStatusBarStyle.mock.calls.map((call) => call.arguments), [['light']]);
    });

    it(`${screen} leaves the declarative status bar to the active tab when unfocused`, () => {
      const harness = createHarness({ focused: false });
      const Screen = harness.load(`screens/${screen}.tsx`).default;
      const view = harness.render(React.createElement(Screen));
      assert.ok(view.texts.includes(heading));
      assert.equal(view.ofType('StatusBar').length, 0);
    });
  }
});
