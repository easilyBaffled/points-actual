import eruda from 'eruda';


eruda.init({
	container: document.body,
	autoScale: true,
	defaults: {
		displaySize: 100
	}
});
eruda._devTools.show();

import("./src/core");
