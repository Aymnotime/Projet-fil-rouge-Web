import 'package:app/Requests.dart';
import 'package:app/pages/Chats/Chats.dart';
import 'package:app/pages/Player/Player.dart';
import 'package:app/pages/Profile/Profile.dart';
import 'package:app/pages/SplashScreen/SplashScreen.dart';
import 'package:app/pages/Teams/Teams.dart';
import 'package:flutter/material.dart';
import 'package:flutterflow_ui/flutterflow_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final SharedPreferences prefs = await SharedPreferences.getInstance();

  await updateHeadersWithCookie();
  final user = await getUser();
  if (user != null) {
    prefs.setString('user', jsonEncode(user));
  } else {
    prefs.remove('user');
    prefs.remove('cookie');
  }

  runApp(MyApp(prefs: prefs));
}

class MyApp extends StatefulWidget {
  final SharedPreferences prefs;

  const MyApp({Key? key, required this.prefs}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

ValueNotifier<String> currentRoute = ValueNotifier('/');
GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class _MyAppState extends State<MyApp> {
  int _getSelectedIndex(String route) {
    switch (route) {
      case '/teams':
        return 0;
      case '/chats':
        return 1;
      case '/profile':
        return 2;
      default:
        return 0; // No valid route for navigation bar, hence no tab is active.
    }
  }

  @override
  Widget build(BuildContext context) {
    final prefs = widget.prefs;
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        primaryColor: Colors.orange,
        useMaterial3: true,
      ),
      home: Scaffold(
        body: PopScope(
          onPopInvoked: (didPop) => didPop ? null : navigatorKey.currentState?.pop(),
          child: Navigator(
            key: navigatorKey,
            initialRoute: prefs.get("user") == null ? '/' : '/teams',
            onGenerateRoute: (settings) {
              builder(context) {
                switch (settings.name) {
                  case '/':
                    return const SplashScreenWidget();
                  case '/teams':
                    return const TeamsWidget();
                  case '/player':
                    return const PlayerWidget();
                  case '/profile':
                    return const MyProfileWidget();
                  case '/chats':
                    return const ChatsWidget();
                  default:
                    return const SizedBox.shrink();
                }
              }

              // ... Your switch statement as before ...
              currentRoute.value =
                  settings.name ?? '/'; // Update the current route
              return MaterialPageRoute(builder: builder, settings: settings);
            },
          ),
        ),
        bottomNavigationBar: ValueListenableBuilder(
          valueListenable: currentRoute,
          builder: (context, String route, child) {
            if (['/', '/splashScreen', '/player'].contains(route)) {
              return SizedBox
                  .shrink(); // Hides the navigation bar on the specified routes
            }
            // Use the current route to determine the selected index.
            int selectedIndex = _getSelectedIndex(route);
            return NavigationBar(
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.sports_football),
                  label: 'Teams',
                ),
                NavigationDestination(
                  icon: Icon(Icons.chat),
                  label: 'Chat',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person),
                  label: 'Profile',
                ),
              ],
              selectedIndex: selectedIndex,
              onDestinationSelected: (int index) {
                String routeName;
                switch (index) {
                  case 0:
                    routeName = '/teams';
                    break;
                  case 1:
                    routeName = '/chats';
                    break;
                  case 2:
                    routeName = '/profile';
                    break;
                  default:
                    return;
                }
                navigatorKey.currentState?.pushReplacementNamed(routeName);
                currentRoute.value = routeName; // Ensure the route is updated.
              },
            );
          },
        ),
      ),
    );
  }
}
