# Printer

Der Printer Docker wird für den Integrationstest des Testbeds gentutzt. Er druckt mittels PostScript den Namen des übergebenen Produkts aus.

## Idee

Hostmaschine Drucker freigeben

Docker erstellen mit OPC UA Server

Methode Drucken mit Produkt URI Parameter

Methode erstellt PostScript und erstellt daraus PDF.

PDF wird mit verlinktem Drucker gedruckt

## Umsetzung (@TODO)

Postscript zum Drucken (Hello World muss ersetzt werden und ggf. mit Datum/Zeit versehen werden)

```
%!PS
/Times-Bold findfont 36 scalefont setfont
72 684 moveto (Hello World!) show
showpage
```

PDF Converter (nicht unbedingt nötig)

```
$ ps2pdf book.ps
```

Drucken des PDFs

```
$ lp book.pdf
```

Docker Freigabe Drucker

``$ sudo docker run -t -i --device=/dev/ttyUSB0 ubuntu bash``

oder 

``$ sudo docker run -t -i --privileged -v /dev/bus/usb:/dev/bus/usb ubuntu bash``