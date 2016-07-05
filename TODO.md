
# TODO

* Test suite (try scraping various stuff from test server, e.g. very long pages!)

## Disabling strict-mode warnings

See: https://docs.slimerjs.org/nightly/manual/addons.html
And: http://superuser.com/questions/349302/how-do-i-permanently-disable-javascript-strict-warnings-in-firefox

It looks like a valid strategy for disabling strict mode warnings from slimer is to pre-create a prefs directory
and spud the following user prefs in there:

user_pref("devtools.errorconsole.deprecation_warnings", false);
user_pref("javascript.options.strict", False);
