import Route from 'ember-route';
import get from 'ember-metal/get';
import service from 'ember-service/inject';

export default Route.extend({
  fastboot: service(),

  // This results in redirecting to `/404` if that isn't the current URL.
  redirect() {
    const notFoundURL = this.router.location.formatURL('/404');
    let path;
    if (get(this, 'fastboot.isFastBoot') === true) {
      path = get(this, 'fastboot.request.path');
    } else {
      path = window.location.pathname;
    }
    if (path !== notFoundURL) {
      this.transitionTo('/404');
    }
  }
});
