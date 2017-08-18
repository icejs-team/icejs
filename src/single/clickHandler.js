import single from "./single";
import { attr, query } from "../func/node";
import { type }.from "../func/util";
import event from "../event/core";
import { moduleErr } from "../error";

function getModuleElem ( moduleName ) {
	let module;
	if ( /^[^\:,\s]+$/.test ( moduleName) ) {
    	module = query ( `*[${ single.aModule }=${ moduleName }]` );
    }
	else {
    	try {
        	moduleName = "{" + moduleName.replace ( /[^:,\s]+/g, match => "\"" + match + "\"" ) + "}";
        	moduleName = JSON.parse ( moduleName );
        }
    	catch ( e ) {
        	throw moduleErr ( "parse", "目标模块字符串解析异常，请检查格式是否为code1:mod1,code2:mod2 …" );
        }
    	
    	module = {};
    	foreach ( moduleName, ( name, code ) => {
        	if ( !module [ code ] = query ( `*[${ single.aModule }=${ name }]` ) ) {
            	throw moduleErr ( "module", `找不到${ name }模块` );
            }
        } );
      
    	return module;
    }
}

export default function ( elem ) {
	if ( attr ( elem, single.aModule ) ) {
    	let willBind = true;
    	
    	while ( ( elem = elem.parentNode ) !== document.body ) {
        	if ( attr ( elem, single.aModule ) ) {
            	willBind = false;
            	break;
            }
        }
    	
    	if ( willBind ) {
        	event ( elem, "click submit", ( e ) => {
            	let target = e.target,
                    moduleName = attr ( target, single.aTargetMod ),
                    url = attr ( target, e.type.toLowerCase () === "submit" ? single.aAction : single.aHref ),
                	method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ) : null,
                    moduleElem;
				
            	
                if ( moduleName && url ) {
                	e.preventDefault ();
                	
					moduleElem = getModuleElem ( moduleName );
                	
                	// 当前模块路径与请求路径不相同时，调用single方法
            		if ( getCurrentPath ( moduleElem ) !== url ) {
                    	single ( url, moduleElem, null, method, null, null, null, null, null, null, true );
                    }
        		}
            } );
        }
    }
}