FROM dart:stable AS build

WORKDIR /app

COPY pubspec.* ./

RUN dart pub get

COPY . .
COPY public /app/bin/public
COPY .env /app/bin/.env

RUN dart pub get --offline
RUN dart compile exe bin/main.dart -o bin/server

FROM scratch
COPY --from=build /runtime/ /
COPY --from=build /app/bin/server /app/bin/server
COPY --from=build /app/bin/public /public
COPY --from=build /app/bin/.env /.env

EXPOSE 8080

CMD ["/app/bin/server"]
