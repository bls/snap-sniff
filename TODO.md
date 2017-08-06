
# TODO

* Test suite (try scraping various stuff from test server, e.g. very long pages!)

## Disabling strict-mode warnings

See: https://docs.slimerjs.org/nightly/manual/addons.html
And: http://superuser.com/questions/349302/how-do-i-permanently-disable-javascript-strict-warnings-in-firefox

It looks like a valid strategy for disabling strict mode warnings from slimer is to pre-create a prefs directory
and spud the following user prefs in there:

user_pref("devtools.errorconsole.deprecation_warnings", false);
user_pref("javascript.options.strict", False);

## Docker stuff

Whuuuu there's a core file spudded into docker images:

```sh
docker run -ti --entrypoint=/bin/bash blairs/snap-sniff
root@bdb173a4b318:/data# file /core
/core: ELF 64-bit LSB core file x86-64, version 1 (SYSV), SVR4-style, from 'auplink /mnt/scratch/var-lib-docker/aufs/mnt/f70abbe99683746b8236d4a214a77b27c2'
root@bdb173a4b318:/data#
```

Need to figure out what layer that's getting added in ><

Also, permissions are all messed up under:

/usr/lib/node_modules/snap-sniff

WTF

