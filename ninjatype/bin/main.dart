import 'dart:io';

import 'package:alfred/alfred.dart';
import 'package:dotenv/dotenv.dart';
import 'package:mongo_dart/mongo_dart.dart';

final _defaultPort = 8080;

class GameEvent {
  String type;
  double duration;
  double multiplier;

  GameEvent.fromJson(Map<String, dynamic> json)
      : type = json['type'],
        duration = 1.0 * json['duration'],
        multiplier = 1.0 * json['multiplier'];

  Map<String, dynamic> toJson() => {
        'type': type,
        'duration': duration,
        'multiplier': multiplier,
      };
}

class Gameplay {
  String id;
  String username;
  DateTime createdAt;
  double score;
  List<GameEvent> events;

  Gameplay.fromJson(Map<String, dynamic> json)
      : id = json['_id'] ?? '',
        username = json['username'],
        score = 1.0 * (json['score'] ?? 0.0),
        createdAt = DateTime.parse(
            json['createdAt'] ?? DateTime.now().toIso8601String()),
        events =
            (json['events'] as List).map((e) => GameEvent.fromJson(e)).toList();

  Map<String, dynamic> toJson() => {
        'username': username,
        'score': score,
        'createdAt': createdAt.toIso8601String(),
        'events': events.map((e) => e.toJson()).toList(),
      };
}

void main() async {
  final app = Alfred();

  final env = DotEnv(includePlatformEnvironment: true);
  env.load();

  final db = await Db.create(env['MONGODB_URI']!);
  await db.open();

  final gameplaysCollection = db.collection('gameplays');

  app.all("*", cors());
  app.get("/*", (req, res) => Directory("public"));

  app.post("/api/publish", (HttpRequest req, HttpResponse res) async {
    final body = await req.bodyAsJsonMap;
    final gameplay = Gameplay.fromJson(body);

    final stored = await gameplaysCollection.insertOne(gameplay.toJson());
    return stored.document;
  });

  app.get("/api/top10Week", (HttpRequest req, HttpResponse res) async {
    final now = DateTime.now();
    final weekAgo = now.subtract(Duration(days: 7));

    final top10HighestScoresOfLastWeek = await gameplaysCollection
        .find(where
            .gte('createdAt', weekAgo.toIso8601String())
            .sortBy('score', descending: true)
            .limit(10))
        .toList();

    return top10HighestScoresOfLastWeek;
  });

  final port = int.tryParse(env['PORT'] ?? '$_defaultPort') ?? _defaultPort;
  await app.listen(port);
}
