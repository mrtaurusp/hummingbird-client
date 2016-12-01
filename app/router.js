import Router from 'ember-router';
import service from 'ember-service/inject';
import { scheduleOnce } from 'ember-runloop';
import get from 'ember-metal/get';
import config from './config/environment';

const RouterInstance = Router.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  fastboot: service(),
  metrics: service(),
  headData: service(),

  didTransition() {
    this._super(...arguments);
    scheduleOnce('afterRender', this, () => {
      let url;
      if (get(this, 'fastboot.isFastBoot') === true) {
        const protocol = get(this, 'fastboot.request.protocol');
        const host = get(this, 'fastboot.request.host');
        url = `${protocol}://${host}${get(this, 'url')}`;
      } else {
        const protocol = window.location.protocol;
        const host = window.location.host;
        url = `${protocol}//${host}${get(this, 'url')}`;
      }
      get(this, 'headData').set('url', url);
      const page = get(this, 'url');
      const title = get(this, 'currentRouteName') || 'Unknown';
      get(this, 'metrics').trackPage({ page, title });
    });
  },

  setTitle(title) {
    get(this, 'headData').set('title', title);
  }
});

// eslint-disable-next-line array-callback-return
RouterInstance.map(function() {
  this.route('dashboard', { path: '/' });
  this.route('dashboard/redirect', { path: '/dashboard' });

  ['anime', 'manga'].forEach((media) => {
    this.route(media, function() {
      this.route('show', { path: '/:slug' }, function() {
        this.route('episodes');
        this.route('installments');
        this.route('cast');
        this.route('reviews');
        this.route('quotes');
      });
    });
  });

  this.route('users', { path: '/users/:name' }, function() {
    this.route('library');
    this.route('reviews');
    this.route('followers');
    this.route('following');
  });

  this.route('settings', function() {
    this.route('profile');
    this.route('password');
    this.route('privacy');
    this.route('notifications');
    this.route('blocking');
    this.route('apps');
  });

  this.route('admin', function() {
    this.route('reports');
  });

  this.route('posts', { path: '/posts/:id' });
  this.route('reviews', { path: '/reviews/:id' });
  this.route('notifications');
  this.route('password-reset');
  this.route('confirm-email');

  // These must remain at the bottom of the RouterInstance map
  this.route('server-error', { path: '/500' });
  this.route('not-found', { path: '/*path' });
});

export default RouterInstance;
