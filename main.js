"use strict";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var RESEAU;

$(document).ready(function() {
    $("#machinesContainer").mousedown(function(){return false;});
    $("#paquetContainer").mousedown(function(){return false;});
    RESEAU = new Reseau();
    RESEAU.addMachine();
    RESEAU.addMachine();
    RESEAU.addMachine();
});

function commentaire(text) {
    $("#commentaire").html(text);
}

var PLAYING = -1;
var INTERVAL = false;
var INTERVALWASRUNNING = false;
var RUNNINGFUNC;

function play() {
    if (PLAYING == -1) {
        PLAYING = true;
        RESEAU.tourner();
    }
    else if (PLAYING) {
        var running = INTERVAL;
        INTERVAL = true;
        intervalOnOff();
        PLAYING = false;
        INTERVALWASRUNNING = running;
    }
    else {
        PLAYING = true;
        if (INTERVALWASRUNNING) {
            INTERVAL = false;
            intervalOnOff();
        }
        if (RUNNINGFUNC) {
            RUNNINGFUNC();
        }
        RUNNINGFUNC = "";
    }
}

function intervalOnOff() {
    if (INTERVAL) {
        for (var i in RESEAU.machines) {
            RESEAU.machines[i].stopInterval();
        }
        $("#interval").removeClass("fa-power-off");
        $("#interval").addClass("fa-random");
    }
    else {
        for (var i in RESEAU.machines) {
            RESEAU.machines[i].startInterval();
        }
        $("#interval").removeClass("fa-random");
        $("#interval").addClass("fa-power-off");
    }
    INTERVAL = !INTERVAL;
    INTERVALWASRUNNING = INTERVAL;
}

function addDest() {
    var dest = prompt("Destinataire :");
    if (dest) {
        RESEAU.machines[RESEAU.index].emettre(dest);
    }
}