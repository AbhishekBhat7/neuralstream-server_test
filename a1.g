# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/rosettes/neuralstream.server"
PassengerBaseURI "/"
PassengerNodejs "/home/rosettes/nodevenv/neuralstream.server/20/bin/node"
PassengerAppType node
PassengerStartupFile index.js
PassengerAppLogFile "/home/rosettes/logs/neuralstream.log"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END

PassengerStickySessions on

# ENV VARS
SetEnv DB_HOST localhost
SetEnv DB_NAME rosettes_neuralstream
SetEnv DB_PASSWORD "admin123@$%"
SetEnv DB_PORT 5432
SetEnv DB_USER rosettes_neuralstream_user
SetEnv JWT_SECRET "682ef2ef199c9ce5faf91e72067add53bd2ba5284b79e15256a502726493516d76aed66f4998943e0f1ade14ec8c5e089f0158c8408e29e0639152ff8de44f2c"
SetEnv ACCESS_TOKEN_EXPIRY 30m
SetEnv REFRESH_TOKEN_VALIDITY_DAYS 60

<IfModule Litespeed>
SetEnv DB_HOST localhost
SetEnv DB_NAME rosettes_neuralstream
SetEnv DB_PASSWORD "admin123@$%"
SetEnv DB_PORT 5432
SetEnv DB_USER rosettes_neuralstream_user
SetEnv JWT_SECRET "682ef2ef199c9ce5faf91e72067add53bd2ba5284b79e15256a502726493516d76aed66f4998943e0f1ade14ec8c5e089f0158c8408e29e0639152ff8de44f2c"
SetEnv ACCESS_TOKEN_EXPIRY 30m
SetEnv REFRESH_TOKEN_VALIDITY_DAYS 60
</IfModule>

RewriteEngine On

# WebSocket upgrade - routes /ws to Passenger on same port
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^/?ws$ ws://127.0.0.1:%{ENV:PASSENGER_LISTEN_PORT}/ws [P,L]