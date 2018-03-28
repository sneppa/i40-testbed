# Docker für Repository

Mit diesem Docker werden zu fertigende Produkte als OPC UA Server angeboten.

Die Produkte werden in einer mongoDB gespeichert.

## Konfigurieren

Im Rootfolder befindet sich eine config.js. Mit Hilfe dieser können alle benötigten Parameter angepasst werden.

## Starten mit Docker

Vor dem ersten Start:

``$ docker-compose build``

Starten mit:

``$ docker-compose up -d``

Troubleshooting: Sollte das Interface über http://localhost:8090 nicht erreichbar sein, könnte dies an der Windows Docker Installation liegen, diese prüfen, ggf. auf Linux testen oder anderem System.

## Datenbank 'repository'

In der Datenbank werden alle Produkte des Repositories gespeichert.

## products

In dieser Collection werden alle Produkte mit ihren Eigenschaften abgelegt.

```javascript
{
  name: String, // Produktname
  type: String, // Name des Produkttyps
  type_id: String, // ID des Produkttyps
  var: [ // Variablen des Produkts
    {
      index: Integer, // Index der Variable
      name: String, // Name der Variable
      type: String, // Datentyp der Variable
      value: String // Wert der Variable
    },
    ...
  ],
  step: [ // Produktionsstufen des Produkts
    {
      index: Integer, // Index der Produktionsstufe
      name: String // Name der Produktionsstufe
    },
    ...
  ],
  currentStep: Integer, // Aktuelle Produktionsstufe
  log: [ // Lognachrichten
    {
      msg: String; // Lognachricht
    }
  ],
  status: String, // Aktueller Status [WAIT, PRODUCE, FAILURE]
  location: String // Aktuelle Position des Produkts
}
```
