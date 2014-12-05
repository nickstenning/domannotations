browserify := $(shell npm bin)/browserify

domannotations.js: browserify lib/*.js
	$(browserify) -d -s Annotations lib/browser.js -o $@

browserify:
	npm install
