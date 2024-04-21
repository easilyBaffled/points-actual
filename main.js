import eruda from 'eruda';


eruda.init({
	// container: document.body,
	autoScale: true,
	defaults: {
		displaySize: 99
	}
});
eruda._devTools.show();

import("./src/core");
