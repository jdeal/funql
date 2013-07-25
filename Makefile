
GEN = $(wildcard generated/*.js)

build: components index.js $(GEN)
	@component build --dev

components: component.json
	@component install --dev

test: build
	open test/index.html

clean:
	rm -fr build components

.PHONY: clean
