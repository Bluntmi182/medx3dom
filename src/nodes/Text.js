/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/* ### X3DFontStyleNode ### */
x3dom.registerNodeType(
    "X3DFontStyleNode",
    "Text",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFontStyleNode.superClass.call(this, ctx);
        }
    )
);

/* ### FontStyle ### */
x3dom.registerNodeType(
    "FontStyle",
    "Text",
    defineClass(x3dom.nodeTypes.X3DFontStyleNode,
        function (ctx) {
            x3dom.nodeTypes.FontStyle.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'family', ['SERIF']);
            this.addField_SFBool(ctx, 'horizontal', true);
            this.addField_MFString(ctx, 'justify', ['BEGIN']);
            this.addField_SFString(ctx, 'language', "");
            this.addField_SFBool(ctx, 'leftToRight', true);
            this.addField_SFFloat(ctx, 'size', 1.0);
            this.addField_SFFloat(ctx, 'spacing', 1.0);
            this.addField_SFString(ctx, 'style', "PLAIN");
            this.addField_SFBool(ctx, 'topToBottom', true);
        },
		{
        	nodeChanged: function() {
            },

			fieldChanged: function(fieldName) {
				if (fieldName == 'family' || fieldName == 'horizontal' || fieldName == 'justify' || fieldName == 'language' ||
					fieldName == 'leftToRight' || fieldName == 'size' || fieldName == 'spacing' || fieldName == 'style' ||
					fieldName == 'topToBottom') {
                    Array.forEach(this._parentNodes, function (node) {
						node.fieldChanged(fieldName);
                    });
				}
			}
        }
    )
);

x3dom.nodeTypes.FontStyle.defaultNode = function() {
    if (!x3dom.nodeTypes.FontStyle._defaultNode) {
        x3dom.nodeTypes.FontStyle._defaultNode = new x3dom.nodeTypes.FontStyle();
        x3dom.nodeTypes.FontStyle._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.FontStyle._defaultNode;
};

/* ### Text ### */
x3dom.registerNodeType(
    "Text",
    "Text",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Text.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'string', []);
            this.addField_MFFloat(ctx, 'length', []);
            this.addField_SFFloat(ctx, 'maxExtent', 0.0);
            this.addField_SFNode ('fontStyle', x3dom.nodeTypes.X3DFontStyleNode);
        },
        {
            nodeChanged: function() {
                if (!this._cf.fontStyle.node) {
                    this.addChild(x3dom.nodeTypes.FontStyle.defaultNode());
                }
            },

            fieldChanged: function(fieldName) {
                if (fieldName == 'string' || fieldName == 'family' ||
                    fieldName == 'horizontal' || fieldName == 'justify' ||
                    fieldName == 'language' || fieldName == 'leftToRight' ||
                    fieldName == 'size' || fieldName == 'spacing' ||
                    fieldName == 'style' || fieldName == 'topToBottom') {
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.texture = true;
                        node._dirty.text = true;
                    });
                }
            }
        }
    ) // defineClass
); // registerNodeType
