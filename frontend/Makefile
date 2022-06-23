# Put any command that doesn't create a file here (almost all of the commands)
.PHONY: \
	format \

usage:
	@echo "Available commands:"
	@echo "format file='file.js'..................Formats JavaScript file."

format:
	@js-beautify -r ${file}
