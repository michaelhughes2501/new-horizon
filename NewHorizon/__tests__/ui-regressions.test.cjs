// Standalone command, once app dependencies are installed (Node 20+):
// node --test __tests__/ui-regressions.test.cjs
// No test runner configuration or additional dependencies are required.
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { compileFunction } = require('node:vm');
const { transformSync } = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const appRoot = path.resolve(__dirname, '..');
const compiledModules = new Map();

// Use the Babel transforms already installed by Expo. Parse the original TSX
// so duplicate import declarations fail before any component can render.
function compile(filename) {
  if (!compiledModules.has(filename)) {
    const { code } = transformSync(readFileSync(filename, 'utf8'), {
      filename,
      babelrc: false,
      configFile: false,
      presets: [require.resolve('@babel/preset-typescript')],
      plugins: [
        [require.resolve('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }],
        require.resolve('@babel/plugin-transform-modules-commonjs'),
      ],
    });
    compiledModules.set(filename, compileFunction(code, ['require', 'module', 'exports'], { filename }));
  }
  return compiledModules.get(filename);
}

// Render real components, React hooks, and context without a native runtime.
// Each harness gets isolated modules, fixtures, and probes. Native components
// expose their props; FlatList implements only its documented header/item/empty
// slots. Focus effects are collected for explicit invocation, not simulated as
// a navigation lifecycle. Supabase and all platform APIs stay outside the test.
function createHarness({ feed = [], notifications = [], focused = true } = {}) {
  const modules = new Map();
  const calls = new Map();
  const focusEffects = [];
  const statusBarStyles = [];
  const navigationContexts = [];

  function probe(name, render = ({ children }) => children ?? null) {
    return function Probe(props) {
      if (!calls.has(name)) calls.set(name, []);
      calls.get(name).push(props);
      return render(props);
    };
  }

  const native = {
    StyleSheet: { create: (styles) => styles },
    View: probe('View'),
    Text: probe('Text', ({ children }) => React.createElement('span', null, children)),
    ScrollView: probe('ScrollView'),
    Pressable: probe('Pressable'),
    Alert: { alert() {} },
    FlatList: probe('FlatList', ({ data, keyExtractor, renderItem, ListHeaderComponent, ListEmptyComponent }) => (
      React.createElement(React.Fragment, null,
        ListHeaderComponent,
        data.length === 0
          ? ListEmptyComponent
          : data.map((item, index) => React.createElement(
            React.Fragment, { key: keyExtractor(item) }, renderItem({ item, index }),
          )),
      )
    )),
  };
  const tab = {
    Navigator: probe('Tab.Navigator'),
    Screen: probe('Tab.Screen', ({ name, component: Component }) => (
      // Mount the real Notifications screen to catch navigation outside its
      // provider, while keeping this root regression independent of other tabs.
      name === 'Notifications' ? React.createElement(Component) : null
    )),
  };
  const mocks = {
    react: React,
    'react-native': native,
    'react-native-safe-area-context': {
      SafeAreaProvider: probe('SafeAreaProvider'),
      useSafeAreaInsets: () => ({ top: 24, right: 0, bottom: 0, left: 0 }),
    },
    'react-native-gesture-handler': { GestureHandlerRootView: probe('GestureHandlerRootView') },
    '@react-navigation/native': {
      DefaultTheme: { colors: {} },
      NavigationContainer: probe('NavigationContainer', ({ children }) => {
        navigationContexts.push(React.useContext(load('lib/notificationsContext.ts').NotificationsContext));
        return children;
      }),
      useIsFocused: () => focused,
      useFocusEffect: (callback) => { focusEffects.push(callback); },
    },
    '@react-navigation/bottom-tabs': { createBottomTabNavigator: () => tab },
    '@expo/vector-icons': { Ionicons: probe('Ionicons', () => null) },
    'expo-status-bar': {
      StatusBar: probe('StatusBar', () => null),
      setStatusBarStyle: (style) => { statusBarStyles.push(style); },
    },
  };

  function load(relativePath) {
    const candidate = path.resolve(appRoot, relativePath);
    const filename = [candidate, `${candidate}.tsx`, `${candidate}.ts`].find(existsSync);
    assert.ok(filename, `Cannot resolve application module: ${relativePath}`);
    if (modules.has(filename)) return modules.get(filename).exports;
    if (filename === path.join(appRoot, 'lib/supabase.ts')) return { BACKEND_READY: false };

    const module = { exports: {} };
    modules.set(filename, module);
    function requireMock(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (specifier.startsWith('.')) {
        return load(path.relative(appRoot, path.resolve(path.dirname(filename), specifier)));
      }
      throw new Error(`Unexpected platform dependency in unit test: ${specifier}`);
    }
    compile(filename)(requireMock, module, module.exports);
    if (filename === path.join(appRoot, 'lib/demoData.ts')) {
      Object.assign(module.exports, { FEED: feed, NOTIFICATIONS: notifications });
    }
    return module.exports;
  }

  function render(Component, props = {}, context) {
    calls.clear();
    focusEffects.length = 0;
    statusBarStyles.length = 0;
    navigationContexts.length = 0;
    let element = React.createElement(Component, props);
    if (context !== undefined) {
      const { NotificationsContext } = load('lib/notificationsContext.ts');
      element = React.createElement(NotificationsContext.Provider, { value: context }, element);
    }
    return renderToStaticMarkup(element);
  }

  return {
    load,
    render,
    props: (name) => calls.get(name) ?? [],
    texts: () => (calls.get('Text') ?? []).map(({ children }) => (
      React.Children.toArray(children).filter((child) => typeof child !== 'object').join('')
    )),
    focusEffects,
    statusBarStyles,
    navigationContexts,
  };
}

function notificationContext(readIds = [], markRead = () => {}) {
  const read = new Set(readIds);
  return { hasRead: (id) => read.has(id), markRead };
}

const posts = [
  { id: 'post-a', author: 'Alex', initials: 'AL', time: '1m', body: 'A fresh start', likes: 0, comments: 0, tag: 'Milestone' },
  { id: 'post-b', author: 'Sam', initials: 'SA', time: '2m', body: 'Community news', likes: 1, comments: 2, tag: 'Guide' },
];
const notifications = [
  { id: 'notice-a', icon: '🤝', title: 'A new connection', detail: 'Alex connected with you', time: '1m', unread: true },
  { id: 'notice-b', icon: '💼', title: 'A new role', detail: 'A role matches your profile', time: '2m', unread: true },
  { id: 'notice-c', icon: '✦', title: 'Welcome', detail: 'Your journey begins', time: '3m', unread: false },
];

test('EmptyState renders its required title and default icon without a detail row', () => {
  const h = createHarness();
  h.render(h.load('components/EmptyState.tsx').EmptyState, { title: 'Nothing here yet' });
  assert.deepEqual(h.texts(), ['✦', 'Nothing here yet']);
});

test('EmptyState renders a custom icon and preserves title and detail text', () => {
  const h = createHarness();
  const title = 'No connections yet';
  const detail = "We'll show new connections here — check back soon.";
  h.render(h.load('components/EmptyState.tsx').EmptyState, { icon: '🤝', title, detail });
  assert.deepEqual(h.texts(), ['🤝', title, detail]);
});

for (const detail of [undefined, '']) {
  test(`EmptyState omits the detail row for ${JSON.stringify(detail)}`, () => {
    const h = createHarness();
    h.render(h.load('components/EmptyState.tsx').EmptyState, { title: 'Empty', detail });
    assert.deepEqual(h.texts(), ['✦', 'Empty']);
  });
}

test('EmptyState uses the default for an undefined icon but preserves an explicit empty icon', () => {
  const h = createHarness();
  const { EmptyState } = h.load('components/EmptyState.tsx');
  h.render(EmptyState, { title: 'Empty', icon: undefined });
  assert.deepEqual(h.texts(), ['✦', 'Empty']);
  h.render(EmptyState, { title: 'Empty', icon: '' });
  assert.deepEqual(h.texts(), ['', 'Empty']);
});

test('FeedScreen supplies the shared empty state to FlatList and keeps its list header', () => {
  const h = createHarness();
  h.render(h.load('screens/FeedScreen.tsx').default);
  const [list] = h.props('FlatList');
  assert.equal(h.props('FlatList').length, 1);
  assert.deepEqual(list.data, []);
  assert.equal(list.ListEmptyComponent.type, h.load('components/EmptyState.tsx').EmptyState);
  assert.ok(h.texts().includes('The Yard'));
  assert.ok(h.texts().includes('What the community is sharing today'));
  assert.ok(h.texts().includes('👥'));
  assert.ok(h.texts().includes('The Yard is quiet right now'));
  assert.ok(h.texts().includes('Check back soon — new posts from the community will show up here.'));
  assert.equal(h.props('Pressable').length, 0);
});

for (const count of [1, 2]) {
  test(`FeedScreen renders ${count} post(s) without the empty message`, () => {
    const feed = posts.slice(0, count);
    const h = createHarness({ feed });
    h.render(h.load('screens/FeedScreen.tsx').default);
    assert.equal(h.props('FlatList')[0].data, feed);
    for (const post of feed) assert.ok(h.texts().includes(post.body));
    assert.ok(!h.texts().includes('The Yard is quiet right now'));
    assert.ok(!h.texts().includes('Check back soon — new posts from the community will show up here.'));
  });
}

for (const focused of [true, false]) {
  test(`NotificationsScreen renders an empty list with focused=${focused}`, () => {
    const h = createHarness({ focused });
    h.render(h.load('screens/NotificationsScreen.tsx').default, {}, notificationContext());
    assert.deepEqual(h.texts(), [
      'Notifications',
      '🔔',
      'No notifications yet',
      "We'll let you know here when there's something new — connections, job matches, and reminders.",
    ]);
    assert.equal(h.props('Pressable').length, 0);
    assert.deepEqual(h.props('StatusBar').map(({ style }) => style), focused ? ['dark'] : []);
  });
}

for (const { readIds, expectedBadge } of [
  { readIds: [], expectedBadge: '2 new' },
  { readIds: ['notice-a'], expectedBadge: '1 new' },
  { readIds: ['notice-a', 'notice-b'], expectedBadge: undefined },
]) {
  test(`NotificationsScreen keeps populated rows when ${readIds.length} unread item(s) have been read`, () => {
    const h = createHarness({ notifications });
    const context = notificationContext(readIds);
    h.render(h.load('screens/NotificationsScreen.tsx').default, {}, context);
    assert.ok(!h.texts().includes('No notifications yet'));
    assert.equal(h.props('Pressable').length, notifications.length);
    const badges = h.texts().filter((text) => /^\d+ new$/.test(text));
    assert.deepEqual(badges, expectedBadge ? [expectedBadge] : []);
    for (const [index, notice] of notifications.entries()) {
      const row = h.props('Pressable')[index];
      const unreadSuffix = notice.unread && !context.hasRead(notice.id) ? '. Unread' : '';
      assert.equal(row.accessibilityRole, 'button');
      assert.equal(row.accessibilityLabel, `${notice.title}. ${notice.detail}${unreadSuffix}`);
      assert.ok(h.texts().includes(notice.title));
      assert.ok(h.texts().includes(notice.detail));
      assert.ok(h.texts().includes(notice.time));
    }
  });
}

test('NotificationsScreen keeps an already-read notification instead of showing the empty state', () => {
  const h = createHarness({ notifications: [notifications[2]] });
  h.render(h.load('screens/NotificationsScreen.tsx').default, {}, notificationContext());
  assert.equal(h.props('Pressable').length, 1);
  assert.ok(h.texts().includes('Welcome'));
  assert.ok(!h.texts().includes('No notifications yet'));
  assert.ok(!h.texts().some((text) => /^\d+ new$/.test(text)));
});

test('NotificationsScreen delegates a row press to markRead with only that notification ID', () => {
  const markedIds = [];
  const h = createHarness({ notifications });
  h.render(h.load('screens/NotificationsScreen.tsx').default, {}, notificationContext([], (id) => markedIds.push(id)));
  assert.deepEqual(markedIds, []);
  h.props('Pressable')[1].onPress();
  assert.deepEqual(markedIds, ['notice-b']);
});

for (const data of [[], notifications]) {
  const state = data.length ? 'populated' : 'empty';
  test(`NotificationsScreen registers exactly one focus callback for a ${state} list`, () => {
    const h = createHarness({ notifications: data });
    h.render(h.load('screens/NotificationsScreen.tsx').default, {}, notificationContext());
    assert.equal(h.focusEffects.length, 1);
    assert.deepEqual(h.statusBarStyles, []);
    h.focusEffects[0]();
    assert.deepEqual(h.statusBarStyles, ['dark']);
  });

  test(`NotificationsScreen requires its provider even for a ${state} list`, () => {
    const h = createHarness({ notifications: data });
    assert.throws(
      () => h.render(h.load('screens/NotificationsScreen.tsx').default),
      { message: 'NotificationsScreen must be rendered within NotificationsContext.Provider' },
    );
  });
}

for (const [screen, visibleText] of [['HomeScreen', 'NEW HORIZON'], ['ProfileScreen', 'Marcus Johnson']]) {
  for (const focused of [true, false]) {
    test(`${screen} imports and renders after import deduplication with focused=${focused}`, () => {
      const h = createHarness({ focused });
      h.render(h.load(`screens/${screen}.tsx`).default);
      assert.ok(h.texts().includes(visibleText));
      assert.deepEqual(h.props('StatusBar').map(({ style }) => style), focused ? ['light'] : []);
      assert.equal(h.focusEffects.length, 1);
      h.focusEffects[0]();
      assert.deepEqual(h.statusBarStyles, ['light']);
    });
  }
}

for (const { data, expectedBadge, description } of [
  { data: [], expectedBadge: undefined, description: 'empty notifications' },
  { data: notifications, expectedBadge: 2, description: 'mixed read and unread notifications' },
  { data: [notifications[2]], expectedBadge: undefined, description: 'only read notifications' },
]) {
  test(`App mounts one navigation tree inside the notification provider with ${description}`, () => {
    const h = createHarness({ notifications: data });
    h.render(h.load('App.tsx').default);
    assert.equal(h.props('NavigationContainer').length, 1);
    assert.equal(h.props('Tab.Navigator').length, 1);
    const screens = h.props('Tab.Screen');
    assert.deepEqual(screens.map(({ name }) => name), ['Home', 'Feed', 'Notifications', 'Profile']);
    assert.equal(screens.find(({ name }) => name === 'Feed').options.tabBarLabel, 'The Yard');
    const alerts = screens.find(({ name }) => name === 'Notifications');
    assert.equal(alerts.options.tabBarLabel, 'Alerts');
    assert.equal(alerts.options.tabBarBadge, expectedBadge);
    const [context] = h.navigationContexts;
    assert.ok(context, 'The navigation container must be inside NotificationsContext.Provider');
    assert.equal(typeof context.markRead, 'function');
    assert.equal(context.hasRead('notice-a'), false);
    // Only the Notifications route is mounted by the navigator double. The
    // light bar therefore comes from App and verifies its previously missing import.
    assert.equal(h.props('StatusBar').filter(({ style }) => style === 'light').length, 1);
    assert.ok(h.texts().includes(data.length ? data[0].title : 'No notifications yet'));
  });
}
