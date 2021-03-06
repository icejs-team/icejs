import Tmpl from "src/compiler/tmpl/core";
import ViewModel from "core/ViewModel";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";

describe ( "directive event bind => ", () => {
    let d;
    
    beforeEach ( () => {
        d = VElement ( "div" );
    } );
    
    it ( "directive :on without function param", ( done ) => {
        d.appendChild ( VElement ( "p", { ":onclick" : "click" }, null, [
            VTextNode ( "btn" )
        ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                click : function ( event ){
                    done ();
                    expect ( event.type ).toBe ( "click" );
                }
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        d.diff ( dBackup ).patch ();
        d.children [ 0 ].node.click ();
    } );

    it ( "directive :on with basic data type function param", ( done ) => {
        d.appendChild ( VElement ( "p", { ":onclick" : "click ( 666, '555' )" }, null, [
            VTextNode ( "btn" )
        ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                click : function ( event, arg, arg2 ){
                    done ();
                    expect ( event.type ).toBe ( "click" );
                    expect ( arg ).toBe ( 666 );
                    expect ( arg2 ).toBe ( "555" );
                }
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        d.diff ( dBackup ).patch ();
        d.children [ 0 ].node.click ();
    } );

    it ( "directive :on with reactive param", ( done ) => {
        d.appendChild ( VElement ( "p", { ":onclick" : "click ( text )" }, null, [
            VTextNode ( "btn" )
        ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                text: "hello icejs",
                click : function ( event, arg ){
                    done ();
                    expect ( event.type ).toBe ( "click" );
                    expect ( arg ).toBe ( "hello icejs" );
                }
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        d.diff ( dBackup ).patch ();
        d.children [ 0 ].node.click ();
    } );

    it ( "directive :on with directive 'for' scoped param", ( done ) => {
        d.appendChild ( VElement ( "p", { ":for" : "( item, key ) in list", ":onclick" : "click ( item, key )" }, null, [
                VTextNode ( "btn" )
            ] ) );
        const realDOM = d.render ();

        let dBackup = d.clone (),
            vm = new ViewModel ( {
                list : [ "hello icejs0", "hello icejs1", "hello icejs2" ],
                click : function ( event, arg, key ) {
                    done ();
                    expect ( event.type ).toBe ( "click" );
                    expect ( arg ).toBe ( "hello icejs" + key );
                }
            } ),
            t = new Tmpl ( vm, [], {} );
        t.mount ( d, true );

        d.diff ( dBackup ).patch ();
        // d.children [ 0 ]为startNode
        d.children [ 1 ].node.click ();
        d.children [ 2 ].node.click ();
        d.children [ 3 ].node.click ();
    } );
} );