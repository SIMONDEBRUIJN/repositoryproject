'use strict';
//------------------------------------------------------------------------------------------------

//declaratie
var getal = 0;
var ArrayGetallen = [];
var ArrayRebussen = ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen"];
var code = ""; //opslaan als string
var ingegevenCode = "";
var score = 0;
var tijd = 60; //eventueel tijd aanpassen voor moeilijkheid
var aantalResets = 3;
var mijnTimer;
//vars voor highscore
var db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
var msg;
//geluid
var riser;
var boom;
//------------------------------------------------------------------------------------------------

//functies
//random getal met paramenters minimum en maximum
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//nieuw raadsel
function nieuwRaadsel() {
//maak een random combinatie van 4 cijfers tussen 0 en 9
        for (var i=0;i<4;i++)
        {
            ArrayGetallen[i] = random(0,9);        
        }
        
        //zet rebussen op het scherm
        for (var i=0;i<4;i++)
        {
            //zoek het pad van de afbeeldingen met random afbeelding 1 of 2
            var pad =  "/img/" + ArrayRebussen[ArrayGetallen[i]] + random(1,2)
                +".jpg"; 
            //geef de id van de afbeelding
            var idAfbeelding =  "#rebus" + (i + 1);                
            //vervang de afbeelding bij het juiste blok
            $(idAfbeelding).attr('src',pad);           
        }
        
        //sla de code op die bestaat uit de random gegenereerde getallen
        
        for (var i=0;i<4;i++)
        {
            code += ArrayGetallen[i]; 
        }           
        
    
}
//function voor de timer
function startTimer() {
    mijnTimer = setInterval(timerEvent, 1000);
    zetRiser("aan");
}
function stopTimer() {
    clearInterval(mijnTimer);
}
//functie die wordt opgeroepen door timer
function timerEvent() {
    if (tijd > 0)
    {
        //count down
        tijd -= 1;
        //tekst met tijd erin
        var tekst = "Time = " + tijd + "s";
        //zet op scherm
        $("#time").text(tekst);
            
    }
    else
    {
        //tijd is op
        $("#time").text("Time is up"); 
        //game over
        gameOver();
        //ga naar de gameoverpagina    
        $(location).attr( 'href' , "#pagina_gameOver");
    }    
    
}
//reset alle variabelen en labels
function reset() {
    code = "";
    ingegevenCode = "";
    $("#ingegevenCode").text("****"); 
    //stop timer
    stopTimer();
    //zet seconden terug
    tijd = 60;   
}
//geluidfuncties
function zetRiser(aanUit) {
    if (aanUit === "aan")
    {
        //zet risergeluid aan 
        riser = $("#riser")[0];
        riser.play();        
    }
    else if (aanUit === "uit")
    {
        //zet risergeluid uit 
        riser = $("#riser")[0];
        riser.pause();        
        riser.currentTime = 0;
    }
    
}
function zetBoom(aanUit) {
    if (aanUit === "aan")
    {
        //zet risergeluid aan 
        boom = $("#boom")[0];
        boom.play();        
        
    }
    else if (aanUit === "uit")
    {
        //zet risergeluid uit 
        boom = $("#boom")[0];
        boom.pause();
        riser.currentTime = 0;        
    }
    
}
//Score opslaan via sql
function gameOver() {
    zetRiser("uit");
    zetBoom("aan");
    //stop het spel
    //stop de timer
    stopTimer();    
    //sla de score op in database
    db.transaction(function (tx) {                     
                    /*Maak table HIGHSCORE aan */
                    tx.executeSql('CREATE TABLE IF NOT EXISTS HIGHSCORES (naam, score)');
                    /*Voeg content toe aan tabel */
                    tx.executeSql('INSERT INTO HIGHSCORES (naam, score) VALUES (?, ?)', ["Speler",score]);     

                });
    
    //toon score
    $("#displayScore").text("Score: " + score);
    //reset score en tijd, resets terug op 3
    reset(); 
       
    //zet afbeeldingen terug        
    //het pad naar load afbeeldingen
    /*var pad =  "\img\load.jpg"; 
    $(".rebus").attr('src',pad);   */ 
          
            
    $("#reset").text("start");
    $("#time").text("Time = 60s");
    $("#score").text("Bombs defused = 0");
    aantalResets = 3;    
    
}
//toon database
function toonDb() {
    //clear de div eerst
    document.querySelector('#status').innerHTML =  "";
    //maak connectie met database
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM HIGHSCORES WHERE score != 0 ORDER BY score DESC', [], function (tx, results) {
        var len = results.rows.length, i;        
        /*Zet alle gevonde rijen op het scherm */	
        for (i = 0; i < len ; i++){
            msg = "<p><b>" +  results.rows.item(i).naam + ": " +results.rows.item(i).score + "</b></p>";
            document.querySelector('#status').innerHTML +=  msg;
        }
                }, null);
    });
                
}
//------------------------------------------------------------------------------------------------

//events
//als het document geladen is
$( document ).ready(function() {
    //wanneer het document gelanden is, zet highscores op het scherm
    //toon de database
    toonDb();
    //
    //ga naar de startpagina    
    $(location).attr( 'href' , "#pagina_menu");
    
    //-------------------------
    //klikevents
    //er word op reset gedrukt
    $( "#reset" ).click(function() {
        //Aantal resets - 1
        if ($("#reset").text() === "start")
        {
            $("#reset").text("reset (" + aantalResets + ")" ); 
            reset();      
            //maak nieuw raadsel
            nieuwRaadsel();    
            //zet timer aan
            startTimer();             
        }
        else if (aantalResets > 0 && $("#reset").text() != "start" )
        {
            aantalResets -= 1; 
            $("#reset").text("reset (" + aantalResets + ")" );            
            //
            reset();      
            //maak nieuw raadsel
            nieuwRaadsel(); 
            //zet riser uit
            zetRiser("uit");
            //zet timer aan
            startTimer();            
        }        
        else
        {            
            gameOver();
            //ga naar de gameoverpagina    
            $(location).attr( 'href' , "#pagina_gameOver");
        }
        
        
        
    });
    //er word op nummerknoppen gedrukt
    $( ".num" ).click(function() {
        //sla de waarde van de knop op als var valueKnop
        var valueKnop = $(this).text();
        //voeg cijfer toe aan ingegeveCode
        if (ingegevenCode.length < 4)
        {
            ingegevenCode += valueKnop;
            //toon ingegeven code op scherm met sterretjes waar nog geen cijfer is ingegeven
            var sterretjes = "";
            for (var i=0;i<(4 - ingegevenCode.length);i++)
            {
                sterretjes += "*";
            } 
            $("#ingegevenCode").text(ingegevenCode + sterretjes);
        }            
    });
    //er wordt op check gedrukt
    $( "#check" ).click(function() {
        
        if (ingegevenCode === code && code != "" && tijd != 0)
            {
                //vermeerder de score met 1
                score += 1
                $("#score").text("Bombs defused = " + score); 
                //zet riser uit
                zetRiser("uit");
                //reset
                reset();
                //maak nieuw raadsel
                nieuwRaadsel();
                //zet timer aan
                startTimer();   
            }
        else if (ingegevenCode != code || tijd === 0)
        {            
            //game over
            gameOver();
            //ga naar de gameoverpagina    
            $(location).attr( 'href' , "#pagina_gameOver");
            
        }
    });  
    //er wordt op menu gedrukt
    $( "#menu" ).click(function() {
        
        zetRiser("uit");
        zetBoom("uit");        
        //stop de timer
        stopTimer();  
        //game over
        gameOver();
        //toon de database
        toonDb();
        
    });
});



