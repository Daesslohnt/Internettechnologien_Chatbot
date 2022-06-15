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
    const mydata = require('./public/data1.json')
    const db = require('./public/database.json')

    var nachricht = nachricht.toLowerCase()


    if (this.level == 0){
      let possiblePositiveAnswers = ["ja", "natürlich", "gut", "profession"]
      let possibleNegativeAnswers = ["nein", "nö", "ne", "algemein"]

      for (var PAI in possiblePositiveAnswers){
        if (nachricht.includes(possiblePositiveAnswers[PAI])){
          this.level = 1
          inhalt = 'Für welches Thema interessieren Sie sich?'
          break
        }
      }
      for (var NAI in possibleNegativeAnswers){
        if (nachricht.includes(possibleNegativeAnswers[NAI])){
          this.level = 6
          inhalt = "Haben Sie eine Frage zur Organisation?"
          break
        }
      }
      var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
      console.log('Send: ' + msg)
      this.client.con.sendUTF(msg)
      return
    }
    


    if (this.level == 1){
      let faculties = mydata.themes[2].subject
      for (var FI in faculties){
        for (var AI in faculties[FI].Assoziationen){
          if (nachricht.includes(faculties[FI].Assoziationen[AI])){
            this.level = 2
            inhalt = 'Wahrscheinlich kann jemand aus dem Fakultät ' + faculties[FI].Abteilung
            inhalt += ' Ihnen helfen?'
            break
          }
        }
      }
      var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
      console.log('Send: ' + msg)
      this.client.con.sendUTF(msg)
      return
    }


    if (this.level == 2){
      let possiblePositiveAnswers = ["ja", "natürlich", "gut", "profession"]
      let possibleNegativeAnswers = ["nein", "nö", "ne", "algemein"]
      let isPositiv = false

      for (var PAI in possiblePositiveAnswers){
        if (nachricht.includes(possiblePositiveAnswers[PAI])){
          this.level = 3
          inhalt = 'Könnten Sie das präzesieren?'
          break
        }
      }


      for (var NAI in possibleNegativeAnswers){
        if (nachricht.includes(possibleNegativeAnswers[NAI])){
          this.level = 0
          inhalt = "Dann... Hier sind alle Fakultäte, die wir haben.<br><br>"

          let faculties = mydata.themes[2].subject
          for (var FI in faculties){
            inhalt += faculties[FI].Abteilung + '<br>'
          }
          inhalt += mydata.themes[2].source
        
          inhalt +='<br></br> Versuchen wir vom Anfang an<br>'
          inhalt += 'Möchten Sie unter Fakultäten suchen?'
          break
        }
      }
      
    
      var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
      console.log('Send: ' + msg)
      this.client.con.sendUTF(msg)
      return
    }

    if (this.level == 3){
      var persons = db.Ansprechpartnern
      this.level = 0
      let hasFound = false

      inhalt = 'Das sind mögliche Ansprechpartnern<br><br>'
      for (var PI in persons){
        for (var PrI in persons[PI].Profil){
          if (nachricht.includes(persons[PI].Profil[PrI].toLowerCase())){
            inhalt += persons[PI].Name + '<br>'
            hasFound = true
          }
        }
      }
      

      if (!hasFound){
        inhalt = 'Leider verstehe ich nicht<br><br>'
        inhalt += 'Hier sind alle mögliche Ansprechpartenrn, über die ich weiß<br>'
        for (var PI in persons){
          inhalt += persons[PI].Name + '<br>'
        }
      }


      inhalt += "<br> Wollen Sie weiter unter Fakultäten suchen?"
      var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
      console.log('Send: ' + msg)
      this.client.con.sendUTF(msg)
      return
    }



    if (this.level == 6){
      let possiblePositiveAnswers = ["ja", "natürlich", "gut", "profession"]
      let possibleNegativeAnswers = ["nein", "nö", "ne", "algemein"]
      let organisations = mydata.themes[0].subject

      for (var PAI in possiblePositiveAnswers){
        if (nachricht.includes(possiblePositiveAnswers[PAI])){
          this.level = 0
          inhalt = 'Hier sind die Abteilungen, die Ihnen helfen können:<br><br>'
          for (var AI in organisations){
            inhalt += organisations[AI].Abteilung + '<br>' + organisations[AI].Link + '<br>'
          }

          inhalt += '<br>Wollen sie weiter unter Fakultäten suchen?'
          break
        }
      }

      for (var NAI in possibleNegativeAnswers){
        if (nachricht.includes(possibleNegativeAnswers[NAI])){
          this.level = 8
          inhalt = 'Bezieht sich Ihre Frage auf<br>'
        inhalt += '-Zentralen Gremien<br>'+
        '-Zentralen Einrichtungen<br>' + '-Verwaltung'
        }
      }

      var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
      console.log('Send: ' + msg)
      this.client.con.sendUTF(msg)
      return
    }


    if (this.level == 8){
      if(nachricht.includes("verwaltung")){
        this.level = 0
        let abteilungen = mydata.themes[4].subject
        inhalt = 'Hier sind die mögliche Abteilunge von der Verwaltung<br><br>'

        for (var AI in abteilungen){
          inhalt += abteilungen[AI].Abteilung + '<br>'
        }
      }
      if (nachricht.includes("einrichtung")){
        this.level = 0
        let abteilungen = mydata.themes[3].subject
        inhalt = 'Hier sind die mögliche Abteilunge von der Einrichtungen<br><br>'

        for (var AI in abteilungen){
          inhalt += abteilungen[AI].Abteilung + '<br>'
        }
      }  
      if (nachricht.includes("gremien")){
        this.level = 0
        let abteilungen = mydata.themes[3].subject
        inhalt = 'Hier sind die mögliche Abteilunge von der Verwaltung<br><br>'

        for (var AI in abteilungen){
          inhalt += abteilungen[AI].Abteilung + '<br>'
        }  
      }
      inhalt += '<br><br>Wollen sie weiter unter Fakultäten suchen?'

      var msg = '{"type": "msg", "name": "' + name + '", "msg":"' + inhalt + '"}'
      console.log('Send: ' + msg)
      this.client.con.sendUTF(msg)
      return
    }


  
  }

}



module.exports = bot
