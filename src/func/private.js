import { foreach, type, isEmpty, guid } from "./util";
import { attr } from "./node";
import { identifierPrefix, amAttr } from "../var/const";
import VElement from "../core/vnode/VElement";
import VTextNode from "../core/vnode/VTextNode";
import VFragment from "../core/vnode/VFragment";
import parseHTML from "../compiler/htmlParser/parseHTML";
import query from "../compiler/cssParser/core";
import cache from "../cache/core";


/**
	defineReactiveProperty ( key: String, getter: Function, setter: Function, target: Object )

	Return Type:
	void

	Description:
	转换存取器属性

	URL doc:
	http://amaple.org/######
*/
export function defineReactiveProperty ( key, getter, setter, target ) {
	Object.defineProperty ( target, key, {
		enumerable : true,
		configurable : true,
		get : getter,
		set : setter
	} );
}

/**
	parseGetQuery ( getString: String )

	Return Type:
	Object
	解析后的get参数对象

	Description:
	将形如“?a=1&b=2”的get参数解析为参数对象

	URL doc:
	http://amaple.org/######
*/
export function parseGetQuery ( getString ) {
	const getObject = {};
	if ( getString ) {
		let kv;
		foreach ( ( getString.substr ( 0, 1 ) === "?" ? getString.substr ( 1 ) : getString ).split ( "&" ), getObjectItem => {
	    	kv = getObjectItem.split ( "=" );
	    	getObject [ kv [ 0 ] ] = kv [ 1 ] || "";
	    } );
	}

	return getObject;
}

/**
	getFunctionName ( fn: Function )

	Return Type:
	String
	方法名称

	Description:
	es5兼容模式获取方法名称
	es6下可通过name属性获取类名

	URL doc:
	http://amaple.org/######
*/
export function getFunctionName ( fn ) {
	return type ( fn ) === "function" 
	? fn.name || ( ( fn.toString ().match ( /^function\s+([\w_]+)/ ) || [] ) [ 1 ] )
	: "";
}

/**
	transformCompName ( compName: String, mode?: Boolean )

	Return Type:
	驼峰式或中划线式的组件名

	Description:
	mode不为true时，将中划线风格的组件名转换为驼峰式的组件名
	mode为true时，将驼峰式风格的组件名转换为中划线的组件名

	URL doc:
	http://amaple.org/######
*/
export function transformCompName ( compName, mode ) {
	return ( mode !== true ? 
		compName.toLowerCase ().replace ( /^([a-z])|-(.)/g, ( match, rep1, rep2 ) => ( rep1 || rep2 ).toUpperCase () ) 
		: 
		compName.replace ( /([A-Z])/g, ( match, rep, i ) => ( i > 0 ? "-" : "" ) + rep.toLowerCase () ) 
	);
}

/**
	walkDOM ( vdom: Object, callback: Function, ...extra: Any )

	Return Type:
	void

	Description:
	遍历虚拟节点及子节点
	extra为额外的参数，传入的额外参数将会在第一个遍历项中传入，但不会传入之后遍历的子项中

	URL doc:
	http://amaple.org/######
*/
export function walkVDOM ( vdom, callback, ...extra ) {
	let vnode = vdom;
	do {

		// apply不能传递null或undefined，因为在低版本IE下会函数会被普通形式调用
		callback.apply ( {}, [ vnode ].concat ( extra ) );

		if ( vnode.children && vnode.children [ 0 ] ) {
			walkVDOM ( vnode.children [ 0 ], callback );
		}

	} while ( vnode = vnode.nextSibling () );
}

/**
	queryModuleNode ( moduleName: String, context?: DOMObject )

	Return Type:
	DOMObject

	Description:
	遍历节点及子节点查询对应名称的节点

	URL doc:
	http://amaple.org/######
*/
export function queryModuleNode ( moduleName, context ) {
	let node = context || document.body,
		targetNode;

	do {
		if ( node.nodeType === 1 && attr ( node, amAttr.module ) === moduleName ) {
			targetNode = node;

			break;
		}

		if ( node.firstChild ) {
			if ( targetNode = queryModuleNode ( moduleName, node.firstChild ) ) {
				break;
			}
		}
	} while ( node = node.nextSibling );

	return targetNode;
}

/**
	getReference ( references: Object, refName: String )

	Return Type:
	DOMObject|Object
	被引用的组件行为对象或元素

	Description:
	获取被引用的组件行为对象或元素
	当组件不可见时返回undefined

	URL doc:
	http://amaple.org/######
*/
export function getReference ( references, refName ) {
	let reference = references [ refName ];
	if ( type ( reference ) === "array" ) {
		const _ref = [];
		foreach ( reference, refItem => {
			if ( refItem.parent ) {
				_ref.push ( refItem.isComponent ? refItem.component.action : refItem.node );
			}
		} );
		reference = isEmpty ( _ref ) 
					? undefined 
					: _ref.length === 1 ? _ref [ 0 ] : _ref;
	}
	else {
		reference = reference && reference.parent
			? reference.isComponent ? reference.component.action : reference.node
			: undefined;
	}
	return reference;
}

function buildScopedCss ( styles, scopedCssIdentifier, selectors ) {
	let styleString = "";
	foreach ( styles, styleItem => {

		// 为css选择器添加范围属性限制
		// 但需排除如@keyframes的项
		if ( styleItem.selector.substr ( 0, 1 ) !== "@" ) {
			let selectorArray = [];
			foreach ( styleItem.selector.split ( "," ).map ( item => item.trim () ), selector => {

				// 避免重复css选择器
				if ( selectors.indexOf ( selector ) <= -1 ) {
					selectors.push ( selector );
				}
				const pseudoMatch = selector.match ( /:[\w-()\s]+|::selection/i );

				// 如果有设置伪类，则需在伪类前面添加范围样式
				if ( pseudoMatch ) {
					selectorArray.push ( selector.replace ( pseudoMatch [ 0 ], `[${ scopedCssIdentifier }]${ pseudoMatch [ 0 ] }` ) );
				}
				else {
					selectorArray.push ( `${ selector.trim () }[${ scopedCssIdentifier }]` );
				}
			} );
			styleItem.selector = selectorArray.join ( "," );
		}

		// 当选择器为@media时 表示它内部也是css项，需要去递归调用buildScopedCss函数
		if ( /^@media/.test ( styleItem.selector ) && type ( styleItem.content ) === "array" ) {
			styleItem.content = buildScopedCss ( styleItem.content, scopedCssIdentifier, selectors );
		}

		styleString += `${ styleItem.selector }{${ styleItem.content }}`;
	} );

	return styleString;
}

/**
	stringToVNode ( htmlString: String, styles: Object, scopedCssObject: Object )

	Return Type:
	Object
	转换后的VFragment Object

	Description:
	转换html字符串为vnodes
	并根据局部css选择器为对应vnode添加局部属性
	对应的模块标识会保存到scopedCssObject.identifier中

	URL doc:
	http://amaple.org/######
*/
export function stringToVNode ( htmlString, styles, scopedCssObject ) {
	scopedCssObject = scopedCssObject || {};
	const vstyle = VElement ( "style" );

	let vf = parseHTML ( htmlString ),
		styleString = styles;

	// 将解析的vnode转换为VFragment
	vf = vf.nodeType === 11 ? vf : VFragment ( [ vf ] );
	if ( type ( styles ) === "array" ) {
		const scopedCssIdentifier = scopedCssObject.identifier = identifierPrefix + guid ();
		scopedCssObject.selectors = [];
		styleString = buildScopedCss ( styles, scopedCssIdentifier, scopedCssObject.selectors );

		vstyle.attr ( "scoped", "" );
	}

	if ( styleString.trim () ) {
		vstyle.appendChild ( VTextNode ( styleString ) );
		vf.appendChild ( vstyle );
	}

	return vf;
}

export function appendScopedAttr ( vnode, selectors, identifier ) {
	foreach ( selectors, selector => {
	    foreach ( query ( selector, vnode ), velem => {
	        velem.attr ( identifier, "" );
	    } );
	} );
}

/**
	buildPlugin ( pluginDef: Object, context: Object )

	Return Type:
	void

	Description:
	构建插件对象并保存到缓存中

	URL doc:
	http://amaple.org/######
*/
export function buildPlugin ( pluginDef, context, deps ) {
	deps = cache.getDependentPlugin ( deps || pluginDef.build );
	cache.pushPlugin ( pluginDef.name, pluginDef.build.apply ( context, deps ) );
}

/**
	trimHTML ( htmlString: String )

	Return Type:
	String
	去除空格后的html字符串

	Description:
	去除html标签间的空格与回车
	<pre>内的标签不会被处理

	URL doc:
	http://amaple.org/######
*/
export function trimHTML ( htmlString ) {

	// 表达式1：匹配<pre>/</pre>标签来确定是否在<pre>标签内
	// 表达式2：匹配两个标签间的空格
	const rpreAndBlank = /\s*(\/\s*)?pre\s*|>(\s+)</ig;
	let inPreNum = 0;

	return htmlString.replace ( rpreAndBlank, ( match, rep1, rep2 ) => {
		if ( match.indexOf ( "pre" ) > -1 ) {

			// firefox稍低版本下没有匹配括号内容时为""
			if ( rep1 === undefined || rep1 === "" ) {
				inPreNum ++;
				return match;
			}
			else if ( rep1.substr ( 0, 1 ) === "/" && inPreNum > 0 ) {
				inPreNum --;
				return match;
			}
		}
		else {
			if ( inPreNum > 0 ) {
				return match;
			}
			else {
				return match.replace ( rep2, "" );
			}
		}
	} );
}