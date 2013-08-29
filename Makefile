
build:
	sed "/S_CODE_FILE/r sample.js" wrapper.js > dist.js

.PHONY: build
