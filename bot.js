'use strict'

var WebSocketClient = require('websocket').client

/**
 * bot ist ein einfacher Websocket Chat Client
 */

class bot {

  /**
   * Konstruktor baut den client auf. Er erstellt einen Websocket und verbindet sich zum Server
   * Bitte beachten Sie, dass die Server IP hardcodiert ist. Sie müssen sie umsetzten
   */
  constructor () {

    this.level = 0
    this.personTyp = "none"
    this.abschluss = "none"

    /** Die Websocketverbindung
      */
    this.client = new WebSocketClient()
    /**
     * Wenn der Websocket verbunden ist, dann setzten wir ihn auf true
     */
    this.connected = false

    /**
     * Wenn die Verbindung nicht zustande kommt, dann läuft der Aufruf hier hinein
     */
    this.client.on('connectFailed', function (error) {
      console.log('Connect Error: ' + error.toString())
    })

    /** 
     * Wenn der Client sich mit dem Server verbindet sind wir hier 
    */
    this.client.on('connect', function (connection) {
      this.con = connection
      console.log('WebSocket Client Connected')
      connection.on('error', function (error) {
        console.log('Connection Error: ' + error.toString())
      })

      /** 
       * Es kann immer sein, dass sich der Client disconnected 
       * (typischer Weise, wenn der Server nicht mehr da ist)
      */
      connection.on('close', function () {
        console.log('echo-protocol Connection Closed')
      })

      /** 
       *    Hier ist der Kern, wenn immmer eine Nachricht empfangen wird, kommt hier die 
       *    Nachricht an. 
      */
      connection.on('message', function (message) {
        if (message.type === 'utf8') {
          var data = JSON.parse(message.utf8Data)
          console.log('Received: ' + data.msg + ' ' + data.name)
        }
      })

      /** 
       * Hier senden wir unsere Kennung damit der Server uns erkennt.
       * Wir formatieren die Kennung als JSON
      */
      function joinGesp () {
        if (connection.connected) {
          connection.sendUTF('{"type": "join", "name":"MegaBot"}')
        }
      }
      joinGesp()
    })
  }

  /**
   * Methode um sich mit dem Server zu verbinden. Achtung wir nutzen localhost
   * 
   */
  connect () {
    this.client.connect('ws://localhost:8181/', 'chat')
    this.connected = true
  }

  /** 
   * Hier muss ihre Verarbeitungslogik integriert werden.
   * Diese Funktion wird automatisch im Server aufgerufen, wenn etwas ankommt, das wir 
   * nicht geschrieben haben
   * @param nachricht auf die der bot reagieren soll
  */
  post (nachricht) {
    var name = 'Megabot'
    var inhalt = 'Entschuldigung hab nicht verstanden.<br>Wahrscheinlich haben Sie einen Tippfehler gemacht?'
    const mydata = require('./public/angewandte_informatik.json')

    var nachricht = nachricht.toLowerCase()

    if (this.level == 0){
      if (nachricht.includes("ansprechpartner")){
        this.level = 1
        
        inhalt = 'Es gibt Professoren, Wissenschaftliche Mitarbeiter und Mitarbeiter' +
        '<br>In welcher Gruppe soll ich suchen?'
        this.sendMessage(name, inhalt)
        return
      }
      if (nachricht.includes("tabella")){
        this.level = 2

        inhalt = 'In welchem Kurs sind Sie?'
        this.sendMessage(name, inhalt)
        return
      }
      if (nachricht.includes("klausur")){
        this.level = 3

        inhalt = 'Welcher Abschluss?'
        this.sendMessage(name, inhalt)
        return
      }
    }


    if (this.level == 1){
      if (nachricht.includes("professor")){
        this.level = 4
        this.personTyp = "prof"
        
        inhalt = 'Suchen Sie nach jemandem konkret?'
        this.sendMessage(name, inhalt)
        return
      }
    }

    if (this.level == 4){
      let persons
      switch (this.personTyp) {
        case "prof":
          persons = mydata.ansprechpartenrn.Professoren
          break;
        case "wm":
          persons = mydata.ansprechpartenrn['wissenschaftliche mitarbeitern']
          break;
        case "mta":
          persons = mydata.ansprechpartenrn.mitarbeitern
          break;
        default:
          break;
      }

      for (var pi in persons){
        if (nachricht.includes(persons[pi].name)){
          let p = persons[pi]
          inhalt = p.name + '<br>' + p.status + '<br>' + p.kabinet + '<br>' + p.tnummer
          this.sendMessage(name, inhalt)
          this.level = 0
          return
        }
      }
      inhalt = 'Hier sind alle Ansperchpartenern, die ich kenne.<br>'
      for (var pi in persons){
        let p = persons[pi]
        inhalt += '<br>' + p.name + '<br>' + p.status + '<br>' + p.kabinet + '<br>' + p.tnummer + '<br>'
      } 
      this.level = 0
      this.sendMessage(name, inhalt)
      return
    }


    if (this.level == 2){
      let kursen = mydata.tabella
      for (var ki in kursen){
        if (nachricht.includes(ki)){
          inhalt = 'Hier ist der Link zur PDF Datei<br>'+ kursen[ki]
          this.sendMessage(name, inhalt)
          this.level = 0
          return
        }
      }
    }


    if (this.level == 3){
      if (nachricht.includes("bachelor")){
        this.abschluss = "B"
      }
      if (nachricht.includes("master")){
        this.abschluss = "M"
      }
      if (nachricht.includes("berufsbegleitend")){
        this.abschluss = "D"
      }

      inhalt = 'Welcher Kurs?'
      this.level = 5
      this.sendMessage(name, inhalt)
      return
    }

    if (this.level == 5){
      let kursen
      switch (this.abschluss) {
        case "B":
          kursen = mydata.klausuren.bachelor
          break;
        case "M":
          kursen = mydata.klausuren.master
          break;
        case "D":
          kursen = mydata.klausuren.dual
          break;
        default:
          break;
      }

      
      for (var ki in kursen){
        if (nachricht.includes(ki)){
          inhalt = 'Hier ist der Link zu den Prüfungsterminen: ' + ki +
          '<br>' + kursen[ki]
          this.sendMessage(name, inhalt)
          this.level = 0
          return
        }
      }
      inhalt = 'Hier sind alle linke zu den Prüfungsteminen:<br>'
      for (var ki in kursen){
        inhalt += '<br>' + ki + '<br>' + kursen[ki]
      } 
      this.level = 0
      this.sendMessage(name, inhalt)
      return
    }






    this.sendMessage(name, inhalt)
  }

  sendMessage(name, inhalt){
    var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
    console.log('Send: ' + msg)
    this.client.con.sendUTF(msg)
  }

}


module.exports = bot
