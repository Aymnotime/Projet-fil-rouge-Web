import 'package:app/Requests.dart';
import 'package:app/Types.dart';
import 'package:flutter/material.dart';
import 'package:flutterflow_ui/flutterflow_ui.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:app/main.dart';

class ChatsWidget extends StatefulWidget {
  const ChatsWidget({Key? key}) : super(key: key);

  @override
  State<ChatsWidget> createState() => _ChatsWidgetState();
}

class _ChatsWidgetState extends State<ChatsWidget> {
  late Future<List<Chat>> _chatsFuture;

  @override
  void initState() {
    super.initState();
    _chatsFuture =
        getChats(); // Assuming getTeams is a global function or part of a class
  }

  final animationsMap = {
    'containerOnPageLoadAnimation': AnimationInfo(
      trigger: AnimationTrigger.onPageLoad,
      effects: [
        FadeEffect(
          curve: Curves.easeInOut,
          delay: 0.ms,
          duration: 600.ms,
          begin: 0,
          end: 1,
        ),
        MoveEffect(
          curve: Curves.easeInOut,
          delay: 0.ms,
          duration: 600.ms,
          begin: Offset(0, 70),
          end: Offset(0, 0),
        ),
      ],
    ),
  };

  @override
  Widget build(BuildContext context) {
    return PopScope(
        canPop: false,
        child: Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            title: Text('Chats',
                style: FlutterFlowTheme.of(context).headlineSmall),
          ),
          body: FutureBuilder<List<Chat>>(
            future: _chatsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text("Error: ${snapshot.error}"));
              } else if (snapshot.hasData) {
                final chats = snapshot.data!;
                return ListView.builder(
                    itemCount: chats.length,
                    itemBuilder: (context, index) {
                      final chat = chats[index];
                      return Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 0),
                          child: ListTile(
                            shape: Border.all(color: Colors.transparent),
                            title: Text(
                              chat.nom,
                              style:
                                  FlutterFlowTheme.of(context).headlineMedium,
                            ),
                            subtitle: Text(
                              chat.lastMessage ?? "No message yet",
                              style: FlutterFlowTheme.of(context).bodySmall,
                            ),
                            leading: chat.type == "team" ?
                              CircleAvatar(
                                backgroundImage: Image.asset(
                                  "assets/images/equipes" + (chat.logo as String)
                                ).image,
                              ) : null,
                            onTap: () {
                              currentRoute.value = '/player';
                              navigatorKey.currentState?.pushNamed('/player',
                                  arguments: {
                                    'isGroup': true,
                                    'previousPage': '/chats',
                                    'data': chat,
                                  });
                            },
                          ).animateOnPageLoad(
                              animationsMap['containerOnPageLoadAnimation']!));
                    });
              } else {
                return const Center(child: Text("No chat found"));
              }
            },
          ),
        ));
  }
}
