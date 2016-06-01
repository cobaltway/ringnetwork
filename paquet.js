"use strict";

function Paquet(conf) {
    var ceci = this;
    this.container = $("#paquetContainer");
    this.obs = conf.obs;
    this.source = conf.source;
    this.dest = conf.dest;
    this.recep = conf.recep;
    this.message = conf.message;
    this.previousElement = false;
    
    this.set = function(element, value) {
        var elementDOM = $("#" + element);
        if (ceci.previousElement && !(ceci.previousElement == elementDOM && elementDOM.hasClass("packetOnWrite"))) {
            ceci.previousElement.parent().removeClass("packetOnWrite");
            ceci.previousElement.parent().removeClass("packetOnRead");
        }
        if (element !== false) {
            if (value === "") {
                value = "&nbsp;";
            }
            ceci[element] = value;
            elementDOM.html(value);
            elementDOM.parent().addClass("packetOnWrite");
        }
        ceci.previousElement = elementDOM;
    }
    
    this.get = function(element) {
        var elementDOM = $("#" + element);
        if (ceci.previousElement && !(ceci.previousElement == elementDOM && elementDOM.hasClass("packetOnRead"))) {
            ceci.previousElement.parent().removeClass("packetOnWrite");
            ceci.previousElement.parent().removeClass("packetOnRead");
        }
        if (element != false) {
            elementDOM.parent().addClass("packetOnRead");
        }
        ceci.previousElement = elementDOM;
        return ceci[element];
    }
    
    this.init = function() {
        ceci.set("obs", ceci.obs);
        ceci.set("source", ceci.source);
        ceci.set("dest", ceci.dest);
        ceci.set("recep", ceci.recep);
        ceci.set("message", ceci.message);
        ceci.set(false);
    }
}