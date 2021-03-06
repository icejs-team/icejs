am.class ( "EditTable" ).extends ( am.Component ) ( {
	init: function () {
		this.propsType ( {
			post: Object
		} );

		return {
			show : true,
			postStr : JSON.stringify ( this.props.post ) || "empty",
			desc : "this is a EditTable component"
		};
	},
	render: function () {
		this.template ( "<span :if='show'>{{ desc }}</span><span :else>error</span><div>{{ postStr }}</div>" ).
		style ( {
			span : { color : "blue" }
		} );
	}
} );