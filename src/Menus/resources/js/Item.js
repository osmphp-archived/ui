import Controller from "Osm_Framework_Js/Controller";
import macaw from 'Osm_Framework_Js/vars/macaw';
import Menu from "./Menu";
import forEachParentElement from "Osm_Framework_Js/forEachParentElement";
import trigger from "Osm_Framework_Js/trigger";

export default class Item extends Controller {
    get menu() {
        return forEachParentElement(this.element, element => macaw.get(element, Menu));
    }

    get name() {
        return this.element.id
            ? this.element.id.substr(this.menu.element.id.length + '__'.length)
            : undefined;
    }

    get hidden() {
        return this.model.hidden;
    }

    set hidden(value) {
        this.model.hidden = value;

        if (value) {
            this.element.classList.add('-hidden');
        }
        else {
            this.element.classList.remove('-hidden');
        }

        this.menu.rearrangeDelimiters();
    }

    withoutEvents(callback) {
        this.dont_trigger_events = true;
        try {
            callback();
        }
        finally {
            this.dont_trigger_events = false;
        }
    }


    trigger(event, data = {}, name = null) {
        if (this.dont_trigger_events) {
            return;
        }

        let menu = this.menu;
        if (!name) {
            name = this.name;
        }

        trigger(menu.element, `menuitem:${event}:${name}`, data);
        data.name = name;
        trigger(menu.element, `menuitem:${event}`, data);
        data.event = event;
        trigger(menu.element, `menuitem`, data);
    }
};
