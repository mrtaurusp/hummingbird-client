import Route from 'ember-route';
import get from 'ember-metal/get';
import service from 'ember-service/inject';

export function initialize() {
  Route.reopen({
    fastboot: service(),

    activate() {
      this._super(...arguments);
      if (get(this, 'fastboot.isFastBoot') === false) {
        window.scrollTo(0, 0);
      }
    }
  });
}

export default {
  name: 'route-scroll',
  initialize
};
