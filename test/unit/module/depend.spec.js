import ice from "ice";

describe ( "depend =>", () => {
	let vm;
	beforeEach ( () => {
		document.body.innerHTML = `<div ice-module="test"></div>`;
	} );

	it ( "deps load asynchronously", ( done ) => {
		ice.module ( "test", {
			deps : { demoPlugin : "demo-plugin" },
			init ( demoPlugin ) {
				// done ();
				// expect ( demoPlugin ).not ().toBeUndefined ();
				return {};
			}
		} );
	} );
} );