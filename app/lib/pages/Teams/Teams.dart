import 'package:app/Requests.dart';
import 'package:app/Types.dart';
import 'package:flutter/material.dart';
import 'package:flutterflow_ui/flutterflow_ui.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:app/main.dart';

class TeamsWidget extends StatefulWidget {
  const TeamsWidget({Key? key}) : super(key: key);

  @override
  State<TeamsWidget> createState() => _TeamsWidgetState();
}

class _TeamsWidgetState extends State<TeamsWidget> {
  late Future<List<TeamRecord>> _teamsFuture;

  @override
  void initState() {
    super.initState();
    _teamsFuture =
        getTeams(); // Assuming getTeams is a global function or part of a class
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
            title: Text('Teams',
                style: FlutterFlowTheme.of(context).headlineSmall),
          ),
          body: FutureBuilder<List<TeamRecord>>(
            future: _teamsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text("Error: ${snapshot.error}"));
              } else if (snapshot.hasData) {
                final teams = snapshot.data!;
                return ListView.builder(
                    itemCount: teams.length,
                    itemBuilder: (context, index) {
                      final team = teams[index];
                      return Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 0),
                          child: ExpansionTile(
                            shape: Border.all(color: Colors.transparent),
                            title: Text(
                              team.nom,
                              style:
                                  FlutterFlowTheme.of(context).headlineMedium,
                            ),
                            subtitle: Text(
                              team.ville,
                              style: FlutterFlowTheme.of(context).bodySmall,
                            ),
                            leading: CircleAvatar(
                              backgroundImage: Image.asset(
                                "assets/images/equipes" + team.logo,
                              ).image,
                            ),
                            children: <Widget>[
                              Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16.0),
                                child: Column(
                                  children: team.joueurs
                                      .map((player) => ListTile(
                                          title: Text(
                                              "${player.prenom} ${player.nom}"),
                                          subtitle: Text(player.email),
                                          onTap: () => {
                                                currentRoute.value = '/player',
                                                navigatorKey.currentState
                                                    ?.pushNamed('/player',
                                                        arguments: {
                                                          'data': player,
                                                          'previousPage': '/teams',
                                                          'isGroup': false,
                                                        })
                                              }))
                                      .toList(),
                                ),
                              ),
                            ],
                          ).animateOnPageLoad(
                              animationsMap['containerOnPageLoadAnimation']!));
                    });
              } else {
                return const Center(child: Text("No teams found"));
              }
            },
          ),
        ));
  }
}
