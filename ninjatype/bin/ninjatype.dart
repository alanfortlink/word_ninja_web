import 'dart:io';

import 'package:alfred/alfred.dart';

void main() async {
  final app = Alfred();

  app.get("/*", (req, res) => Directory("bin/public"));

  await app.listen(3000);
}
