import snackBars from 'Osm_Ui_SnackBars/vars/snackBars';
import FieldGroup from './FieldGroup';
import trigger from 'Osm_Framework_Js/trigger';
import url from 'Osm_Framework_Js/vars/url';
import ajax from 'Osm_Framework_Js/ajax';

export default class Form extends FieldGroup {
    get events() {
        return Object.assign({}, super.events, {
            'submit': 'onSubmit'
        });
    }

    submit() {
        this.onSubmit();
    }

    onSubmit(e) {
        if (e) {
            // form content will be sent via AJAX, so prevent default
            // submit behavior which sends POST request and reloads the page.
            //
            // if submit() method is used, e is undefined, if submit event
            // is handled (for instance after pressing Enter in a form's
            // input field), e is not null
            e.preventDefault();
        }

        if (!this.validate()) {
            return;
        }

        let options = {
            payload: this.value,
            snackbar_message: this.model.submitting_message
        };

        let submitting = new CustomEvent('form:submitting', {
            cancelable: true,
            detail: options,
        });
        this.element.dispatchEvent(submitting);
        if (submitting.defaultPrevented) {
            return;
        }

        ajax(this.element.method + ' ' + url.formAction(this.element.action), options)
            .then(payload => {
                if (payload === undefined) return payload; // response fully handled by previous then()

                try {
                    this.onSuccess(payload);
                    return payload;
                }
                catch (e) {
                    console.error(e);
                    throw e;
                }
            })
            .catch(json => {
                if (!json) {
                    return Promise.reject();
                }

                if (this.onError(json)) {
                    return Promise.reject();
                }

                throw new Error('Unhandled form error');
            });
    }

    onSuccess(payload) {
        trigger(this.element, 'form:success', payload);
    }

    onError(json) {
        if (json.error == 'validation_failed') {
            Object.keys(json.messages).forEach(path => {
                let parts = path.split('/');
                let field = this.findFieldByPath(parts);
                if (!field) {
                    console.log("Field '" + path + "' not found");
                    return;
                }
                field.showError(json.messages[path]);
            });

            snackBars.showMessage(json.message);
            return true;
        }

        return this.onOtherError(json);
    }

    onOtherError(json) {
        snackBars.showMessage(json.message);
        return true;
    }
};
