# Printer

Der Printer Docker wird für den Integrationstest des Testbeds gentutzt. Er druckt mittels PostScript den Namen des übergebenen Produkts aus.

## Voraussetzungen

- CUPS Server auf dem Hostsystem
- Standarddrucker ist eingerichtet

## OPC UA Server

Der Server stellt, wie jeder Server im Testbed, im Service Objekt eine Methode und eine Variable bereit. Die Variable Status zeigt den Status des Servers an (WAIT, ATTEMPTING, PRODUCING). Die Methode zum Drucken nennt sich Drucken und hat die URI des Produkts als Parameter.

## Umsetzung

CUPS Socket wurden per Volumes dem Docker freigegeben. Auf dem Docker wurde der CUPS Client installiert. Eine PostScript Datei wird beim Aufrufen der Methode mit lpr gedruckt.