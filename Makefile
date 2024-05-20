run:
	@(cd ./functions; npm run build && firebase serve --only functions && firebase deploy)