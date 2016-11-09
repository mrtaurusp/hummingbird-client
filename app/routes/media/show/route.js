import Route from 'ember-route';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import { capitalize } from 'ember-string';
import { task, timeout } from 'ember-concurrency';
import CanonicalRedirectMixin from 'client/mixins/routes/canonical-redirect';
import CoverPageMixin from 'client/mixins/routes/cover-page';
import { mediaType } from 'client/helpers/media-type';

export default Route.extend(CanonicalRedirectMixin, CoverPageMixin, {
  templateName: 'media/show',
  session: service(),

  saveEntryTask: task(function* (entry) {
    yield timeout(500);
    return yield entry.save().catch(() => entry.rollbackAttributes());
  }).restartable(),

  model({ slug }) {
    const [type] = get(this, 'routeName').split('.');
    if (slug.match(/\D+/)) {
      return get(this, 'store').query(type, { filter: { slug } })
        .then(records => get(records, 'firstObject'));
    }
    return get(this, 'store').findRecord(type, slug);
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (get(this, 'session.hasUser') === true) {
      const promise = this._getLibraryEntry(model).then((results) => {
        const entry = get(results, 'firstObject');
        set(controller, 'entry', entry);
        if (entry !== undefined) {
          set(controller, 'entry.media', model);
        }
      });
      set(controller, 'entry', promise);
    }
  },

  titleToken(model) {
    return get(model, 'canonicalTitle');
  },

  serialize(model) {
    return { slug: get(model, 'slug') };
  },

  _getLibraryEntry(media) {
    return get(this, 'store').query('library-entry', {
      filter: {
        user_id: get(this, 'session.account.id'),
        media_type: capitalize(mediaType([media])),
        media_id: get(media, 'id')
      },
    });
  },

  actions: {
    createEntry(status) {
      const controller = this.controllerFor(get(this, 'routeName'));
      const user = get(this, 'session.account');
      const media = this.modelFor(get(this, 'routeName'));
      const entry = get(this, 'store').createRecord('library-entry', {
        status,
        user,
        media
      });
      // TODO: Feedback
      return entry.save().then(() => set(controller, 'entry', entry));
    },

    updateEntry(entry, property, status) {
      set(entry, property, status);
      return entry.save().catch(() => entry.rollbackAttributes());
    },

    deleteEntry(entry) {
      const controller = this.controllerFor(get(this, 'routeName'));
      return entry.destroyRecord()
        .then(() => set(controller, 'entry', undefined))
        .catch(() => entry.rollbackAttributes());
    },

    saveEntryDebounced(entry) {
      get(this, 'saveEntryTask').perform(entry);
    }
  }
});
