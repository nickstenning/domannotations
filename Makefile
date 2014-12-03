domannotations.js: lib/*.js
	browserify -d -s Annotations lib/browser.js -o $@
