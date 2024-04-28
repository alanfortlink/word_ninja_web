import 'dart:io';

import 'package:alfred/alfred.dart';
import 'package:dotenv/dotenv.dart';

final _defaultPort = 8080;

void main() async {
  final app = Alfred();

  final env = DotEnv(includePlatformEnvironment: true);
  env.load();

  app.get("/*", (req, res) => Directory("public"));

  final port = int.tryParse(env['PORT'] ?? '$_defaultPort') ?? _defaultPort;
  await app.listen(port);
}
