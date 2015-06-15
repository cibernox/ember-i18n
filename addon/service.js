import Ember from "ember";
import Stream from "./stream";
import Locale from "./locale";
import addTranslations from "./add-translations";

const get = Ember.get;
const Parent = Ember.Service || Ember.Object;

// @public
export default Parent.extend(Ember.Evented, {

  // @public
  // The user's locale.
  locale: null,

  // @public
  //
  // Returns the translation `key` interpolated with `data`
  // in the current `locale`.
  t: function(key, data = {}) {
    const locale = this.get('_locale');
    Ember.assert("I18n: Cannot translate when locale is null", locale);

    const template = locale.getCompiledTemplate(key, get(data, 'count'));

    if (template._isMissing) {
      this.trigger('missing', this.get('locale'), key, data);
    }

    return template(data);
  },

  // @public
  addTranslations: function(locale, translations) {
    addTranslations(locale, translations, this.container);

    if (this.get('locale').indexOf(locale) === 0) {
      this.get('_locale').rebuild();
    }
  },

  _locale: Ember.computed('locale', function() {
    const locale = this.get('locale');
    return locale ? new Locale(this.get('locale'), this.container) : null;
  }),

  _buildLocaleStream: Ember.on('init', function() {
    this.localeStream = new Stream(() => {
      return this.get('locale');
    });
  }),

  _notifyLocaleStream: Ember.observer('locale', function() {
    this.localeStream.value(); // force the stream to be dirty
    this.localeStream.notify();
  })

});
