"use strict";

var ID_INDEX = 0;

function MachineUI(id) {
    var ceci = this;
    this.container = $("#machinesContainer");
    this.machineCaption = $("<div><i class='fa fa-desktop fa-2x'></i><br/>" + id + "</div>");
    this.machineCaption.addClass("machineCaption");
    this.inside = $("<div class='inside'><h2>Machine " + id + "</h2>\
    <span>Messages en attente :</span><div class='attente'></div><br/>\
    <span>Messages envoyés :</span><div class='envoyes'></div><br/>\
    <span>Messages reçus :</span><div class='recu'></div>");
    
    this.add = function() {
        ceci.container.append(ceci.machineCaption);
        ceci.machineCaption.click(ceci.displayInside);
        ceci.container.append(ceci.inside);
        ceci.inside.click(ceci.displayInside);
    }
    
    this.on = function() {
        ceci.machineCaption.addClass("on");
    }
    
    this.off = function() {
        ceci.machineCaption.removeClass("on");
    }
    
    this.displayInside = function() {
        ceci.inside.toggle("slow");
        $("#addDest").toggle("slow");
        $("#addDestOff").toggle("slow");
    }
    
    this.addRecu = function(message) {
        ceci.inside.children(".recu").append("<div>" + message + "</div>");
    }
    
    this.addAttente = function(paquet) {
        ceci.inside.children(".attente").append("<div>''" + paquet.message + "'' <span> <i>pour</i> Machine " + paquet.dest + "</span></div>");
    }
    
    this.addEnvoye = function(paquet) {
        ceci.inside.children(".envoyes").append("<div>''" + paquet.message + "'' <span> <i>pour</i> Machine " + paquet.dest + "</span></div>");
    }
    
    this.delAttente = function() {
        ceci.inside.children(".attente").children().first().remove();
    }
}

function Machine(reseauCallBack, listeMachines) {
    var ceci = this;
    this.reseauTourner = reseauCallBack;
    this.id = ++ID_INDEX;
    this.ui = new MachineUI(this.id);
    this.ui.add();
    this.messagesEnAttente = [];
    
    this.on = function() {
        ceci.ui.on();
    };
    
    this.off = function() {
        ceci.ui.off();
    }
    
    this.traiter = function(paquet) {
        ceci.coucheIn_1(paquet);
    };
    
    this.coucheIn_1 = function(paquet) {
        if (PLAYING) {
        setTimeout(function() {
            if (paquet.get("obs") >= 255) {
                commentaire("<b>Couche 1 inc</b><br/>Obsolescence = max<br/>\
                <i class='fa fa-hand-o-right'></i> Demande de remise à 0 du paquet à la <i>Couche 1 out</i>");
                ceci.coucheOut_1(paquet, "reset");
            }
            else if (paquet.get("obs") == 0 && ceci.messagesEnAttente.length) {
                commentaire("<b>Couche 1 inc</b><br/>Obsolescence = 0 et " + ceci.messagesEnAttente.length + " message(s) en attente<br/>\
                <i class='fa fa-hand-o-right'></i> Demande d'<u>écriture</u> à la <i>Couche 1 out</i>");
                ceci.coucheOut_1(paquet, "ecrire");
            }
            else if (paquet.get("obs") == 0) {
                commentaire("<b>Couche 1 inc</b><br/>Obsolescence = 0 mais pas de message en attente<br/>\
                <i class='fa fa-hand-o-right'></i> Demande de transmission du jeton à la <i>Couche 1 out</i>");
                ceci.coucheOut_1(paquet, "transmettreJeton");
            }
            else {
                commentaire("<b>Couche 1 inc</b><br/>Obsolescence != 0 et != max<br/>\
                <i class='fa fa-hand-o-right'></i> Passage à la <i>Couche 2 inc</i>");
                ceci.coucheIn_2(paquet);
            }
        }, QUANTUM);
        } else {
            RUNNINGFUNC = function() {ceci.coucheIn_1(paquet);};
        }
    };
    
    this.emettre = function(dest) {
        if (dest || getRandomInt(0, 10) > 6) {
            if (!dest) {
                dest = listeMachines[getRandomInt(0, listeMachines.length)].id;
            }
            var paquet = new Paquet({
                obs:1,
                source:ceci.id,
                dest:dest,
                recep:0,
                message:"Bonjour de " + ceci.id
            });
            if (paquet.dest != ceci.id) {
                ceci.messagesEnAttente.push(paquet);
                ceci.ui.addAttente(paquet);
            }
        }
    }
    
    this.ecrire = function() {
        var paquet = ceci.messagesEnAttente.splice(0, 1)[0];
        paquet.init();
        ceci.ui.delAttente();
        ceci.ui.addEnvoye(paquet);
        //console.log(paquet);
        return paquet;
    }
    
    this.coucheOut_1 = function(paquet, consigne) {
        if (PLAYING) {
        setTimeout(function() {
            paquet.set("obs", paquet.get("obs"));
            if (consigne == "reset") {
                commentaire("<b>Couche 1 out</b><br/>Demande de reset<br/>\
                <i class='fa fa-hand-o-right'></i> Création d'un nouveau jeton (octet d'obsolescence = 0)");
                paquet.set("obs", 0);
                paquet.set("source", "");
                paquet.set("dest", "");
                paquet.set("recep", "")
                paquet.set("message", "");
                paquet.set("");
            }
            else if (consigne == "ecrire") {
                commentaire("<b>Couche 1 out</b><br/>Libre pour une écriture<br/>\
                <i class='fa fa-hand-o-right'></i> La machine inscrit le premier de ses messages en attente dans le paquet");
                paquet = ceci.ecrire();
            }
            else if (consigne == "transmettreJeton") {
                commentaire("<b>Couche 1 out</b><br/>Transmission de jeton<br/>\
                <i class='fa fa-hand-o-right'></i> Transmission du jeton à l'identique (pas de modification)");
            }
            else {
                commentaire("<b>Couche 1 out</b><br/>Transmission d'un message<br/>\
                <i class='fa fa-hand-o-right'></i> Incrémentation de l'obsolescence et transmission du paquet");
                paquet.set("obs", (paquet.obs*1) + 1);
            }
            ceci.nextStep(paquet);
        }, QUANTUM);
        } else {
            RUNNINGFUNC = function() {ceci.coucheOut_1(paquet, consigne);};
        }
    };
    
    this.coucheIn_2 = function(paquet) {
        if (PLAYING) {
        setTimeout(function() {
            if (paquet.get("dest") == ceci.id) {
                commentaire("<b>Couche 2 inc</b><br/>La machine est destinataire du paquet<br/>\
                <i class='fa fa-hand-o-right'></i> Passage à la <i>Couche 3 inc</i>");
                ceci.coucheIn_3(paquet);
            }
            else {
                commentaire("<b>Couche 2 inc</b><br/>La machine n'est pas destinataire du paquet<br/>\
                <i class='fa fa-hand-o-right'></i> Demande de transmission à la <i>Couche 1 out</i>");
                ceci.coucheOut_1(paquet);
            }
        }, QUANTUM*2);
        } else {
            RUNNINGFUNC = function() {ceci.coucheIn_2(paquet);};
        }
    };
    
    this.coucheOut_2 = function(paquet, consigne) {
        if (PLAYING) {
        setTimeout(function() {
            if (consigne == "reset") {
                commentaire("<b>Couche 2 out</b><br/>Demande de reset<br/>\
                <i class='fa fa-hand-o-right'></i> Transmission de la demande de reset à la <i>Couche 1 out</i>");
                paquet.set("dest", paquet.get("dest"));
                ceci.coucheOut_1(paquet, "reset");
            }
            else {
                commentaire("<b>Couche 2 out</b><br/>Inversion champs source et destinataire<br/>\
                <i class='fa fa-hand-o-right'></i> Puis transmission à la <i>Couche 1 out</i>");
                var source = paquet.source;
                paquet.set("source", paquet.dest);
                paquet.set("dest", source);
                paquet.set("dest", paquet.get("dest"));
                ceci.coucheOut_1(paquet);
            }
        }, QUANTUM*2);
        } else {
            RUNNINGFUNC = function() {ceci.coucheOut_2(paquet, consigne);};
        }
    };
    
    this.coucheIn_3 = function(paquet) {
        if (PLAYING) {
        setTimeout(function() {
            if (paquet.get("recep") == 0) {
                commentaire("<b>Couche 3 inc</b><br/>Le message n'est pas un accusé de réception (recep = 0)<br/>\
                <i class='fa fa-hand-o-right'></i> Transfert du message à l'application et transmission à la <i>Couche 3 out</i>");
                ceci.coucheApplication(paquet);
            }
            else {
                commentaire("<b>Couche 3 inc</b><br/>Le message est un accusé de réception (recep = 1)<br/>\
                <i class='fa fa-hand-o-right'></i> Demande de reset à la <i>Couche 3 out</i>");
                ceci.coucheOut_3(paquet, "reset");
            }
        }, QUANTUM);
        } else {
            RUNNINGFUNC = function() {ceci.coucheIn_3(paquet);};
        }
    };
    
    this.coucheOut_3 = function(paquet, consigne) {
        if (PLAYING) {
        setTimeout(function() {
            if (consigne == "reset") {
                paquet.set("recep", paquet.get("recep"));
                commentaire("<b>Couche 3 out</b><br/>Consigne de reset pour la Couche 2 out<br/>\
                    <i class='fa fa-hand-o-right'></i> Passage de la consigne reset à la <i>Couche 2 out</i>");
                ceci.coucheOut_2(paquet, "reset");
            }
            else {
                paquet.set("recep", 1);
                commentaire("<b>Couche 3 out</b><br/>On transforme le paquet en accusé de réception<br/>\
                <i class='fa fa-hand-o-right'></i> Bit de reception placé sur 1 et passage à la <i>Couche 2 out</i>");
                ceci.coucheOut_2(paquet);
            }
        }, QUANTUM*2);
        } else {
            RUNNINGFUNC = function() {ceci.coucheOut_3(paquet, consigne);};
        }
    };
    
    this.nextStep = function(paquet) {
        if (PLAYING) {
        setTimeout(function() {
            ceci.reseauTourner(paquet);
        }, QUANTUM);
        } else {
            RUNNINGFUNC = function() {ceci.nextStep(paquet);};
        }
    };
    
    this.stopInterval = function() {
        if (ceci.interval) {
            clearInterval(ceci.interval);
        }
    };
    
    this.startInterval = function() {
        ceci.interval = setInterval(ceci.emettre, QUANTUM*4);
    };
    
    this.coucheApplication = function(paquet) {
        if (PLAYING) {
        setTimeout(function() {
            commentaire("<b>Couche application</b><br/>Utilisation du message...");
            ceci.ui.addRecu(paquet.get("message"));
            ceci.coucheOut_3(paquet);
        }, QUANTUM*2);
        } else {
            RUNNINGFUNC = function() {ceci.coucheApplication(paquet);};
        }
    };
}