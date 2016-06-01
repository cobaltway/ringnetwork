"use strict";

var QUANTUM = 400;

function addUser() {
    if(RESEAU.machines.length < 9) {
        RESEAU.addMachine();
    }
    if (RESEAU.machines.length >= 9) {
        $(this).css('color', 'rgba(250, 250, 250, 0.3)');
        $(this).css('cursor', 'auto');
        $(this).attr('title', '');
    }
}

function Reseau(container) {
    var ceci = this;
    this.machines = [];
    this.index = 0;
    this.paquet = new Paquet({
        obs:0
    });
    
    this.addMachine = function() {
        ceci.machines.push(new Machine(ceci.tourner, ceci.machines));
    };
    
    this.tourner = function(paquet) {
        commentaire("");
        if (paquet) {
            ceci.paquet = paquet;
        }
        else {
            ceci.paquet.init();
        }
        if (ceci.machines[ceci.index]) {
            ceci.machines[ceci.index].off();
        }
        ceci.index++;
        if (ceci.index >= ceci.machines.length) {
            ceci.index = 0;
        }
        ceci.paquet.set(false);
        ceci.machines[ceci.index].on();
        ceci.machines[ceci.index].traiter(ceci.paquet);
        commentaire("");
    };
}