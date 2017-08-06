import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive expr", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive expression will mount in text node", () => {
        d.innerHTML = '<span>{{ expr }}</span><span>{{ expr }}123</span>';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                expr : "success",
            } );
        t.mount ( vm );
    	expect ( d.firstChild.firstChild.nodeValue ).toBe ( "success" );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "success123" );

        vm.expr = "hello";
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello" );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello123" );
    } );
  
	it ( "directive expression will mount in attribute node", () => {
        d.innerHTML = '<p id="{{ id }}">attr expr</p><p id="{{ id }}456">attr expr2</p>';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                id : "text",
            } );
        t.mount ( vm );

    	expect ( d.firstChild.getAttribute ( "id" ) ).toBe ( "text" );
        expect ( d.querySelector ( "#text" ).firstChild.nodeValue ).toBe ( "attr expr" );
        expect ( d.querySelector ( "#text456" ).firstChild.nodeValue ).toBe ( "attr expr2" );

        vm.id = "success";
        expect ( d.firstChild.getAttribute ( "id" ) ).toBe ( "success" );
        expect ( d.querySelector ( "#success" ).firstChild.nodeValue ).toBe ( "attr expr" );
        expect ( d.querySelector ( "#success456" ).firstChild.nodeValue ).toBe ( "attr expr2" );
    } );

    it ( "multiple directive expression in single attribute or single text", () => {
        d.innerHTML = '<p id="{{ id }}{{ text }}">{{ hello }} {{ id }}</p>';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                id : "text",
                text : "222",
                hello : "hello",
            } );
        t.mount ( vm );

        expect ( d.querySelector ( "#text222" ).firstChild.nodeValue ).toBe ( "hello text" );

    } );
} );