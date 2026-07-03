# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/rosettes/neuralstream.server"
PassengerBaseURI "/"
PassengerNodejs "/home/rosettes/nodevenv/neuralstream.server/20/bin/node"
PassengerAppType node
PassengerStartupFile index.js
PassengerAppLogFile "/home/rosettes/logs/neuralstream.log"
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION BEGIN
<IfModule Litespeed>
SetEnv DATABASE_URL postgresql://neondb_owner:npg_6KQJtZPoReX7@ep-jolly-bird-apy0icb5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SetEnv DB_HOST localhost
SetEnv DB_NAME rosettes_neuralstream
SetEnv DB_PASSWORD admin123@$%
SetEnv DB_PORT 5432
SetEnv DB_USER rosettes_neuralstream_user
SetEnv JWT_SECRET 682ef2ef199c9ce5faf91e72067add53bd2ba5284b79e15256a502726493516d76aed66f4998943e0f1ade14ec8c5e089f0158c8408e29e0639152ff8de44f2c
SetEnv ACCESS_TOKEN_EXPIRY 30m
SetEnv REFRESH_TOKEN_VALIDITY_DAYS 60
</IfModule>
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION END