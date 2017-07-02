# ZeroNet JS

A JS version of ZeroNet, using libp2p

# About

This project was mainly created to see how the zeronet protocol can be improved and to provide better programmaticall usage of zeronet.

But it will also be compatible with zeronet-py (and will have an uiserver).

* * *

What works:

-   Well, nothing at the moment

Stuff that might work:

-   Basic Protocol functions (response and cmd)
-   Server (listening and accepting connections)

WIP:

-   ZeroNet Protocol
-   UIServer
-   libp2p-secio crypto

ToDo:

-   Everything else
-   TLS (client => server OK, server => client TIMEOUT)

## Notes

It is not planned to support protocol version v1. Only v2+ will be supported.

Also for now all connections are **unencrypted**. So don't use this in production until beta or until we get tls running.

# Running

Just run `npm start` and it should:

-   Launch a server on 0.0.0.0:15542
-   Make itself visible in the mdns