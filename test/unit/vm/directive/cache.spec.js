import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";

describe ( "directive cache => ", () => {    
    it ( "the directive will take the ':cache' attribute to the vnode's member variable", () => {
        const 
            d = VElement ( "div", { ":cache" : "true" } ),
            t = new Tmpl ( { state : {} } );

        t.mount ( d, true );

        expect ( d.attr ( ":cache" ) ).toBe ( undefined );
        expect ( d.cache ).toBe ( true );
    } );
} );