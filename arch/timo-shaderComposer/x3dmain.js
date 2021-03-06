/*!
* x3dom javascript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
*/

// Add some JS1.6 Array functions:
// (This only includes the non-prototype versions, because otherwise it messes up 'for in' loops)

if (!Array.forEach) {
    Array.forEach = function (array, fun, thisp) {
        var len = array.length;
        for (var i = 0; i < len; i++) {
            if (i in array) {
                fun.call(thisp, array[i], i, array);
            }
        }
    };
}

if (! Array.map) {
    Array.map = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in array) {
                res[i] = fun.call(thisp, array[i], i, array);
            }
        }
        return res;
    };
}

if (! Array.filter) {
    Array.filter = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in array) {
                var val = array[i];
                if (fun.call(thisp, val, i, array)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}

/** @namespace The global x3dom namespace. */
var x3dom = {
    canvases: []
};

x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
x3dom.x3dextNS = 'http://philip.html5.org/x3d/ext';
x3dom.xsltNS = 'http://www.w3.org/1999/XSL/x3dom.Transform';
x3dom.xhtmlNS = 'http://www.w3.org/1999/xhtml';

/** Wraps the given @p canvas with an X3DCanvas object.

    All wrapped canvases are stored in the x3dom.canvases array.
*/
// x3dom.wrap = function(canvas) {
//     var x3dCanvas = new x3dom.X3DCanvas(canvas);
//     x3dom.canvases.push(x3dCanvas);
//     return x3dCanvas;
// };


/** @class x3dom.X3DCanvas
*/
x3dom.X3DCanvas = function(x3dElem) {
    
    this.initContext = function(canvas) {
        x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
        var gl = x3dom.gfx_webgl(canvas);
        if (!gl) {
            x3dom.debug.logError("No 3D context found...");
			this.canvasDiv.removeChild(canvas);
            return null;
        }
        return gl;
    };

    this.createHTMLCanvas = function(x3dElem) {
        x3dom.debug.logInfo("Creating canvas for (X)3D element...");
        var canvas = document.createElement('canvas');
        canvas.setAttribute("class", "x3dom-canvas");
        this.canvasDiv.appendChild(canvas);
        this.canvasDiv.setAttribute("class", "x3dom-canvasdiv");
        
        // check if user wants to style the X3D element
        var userStyle = x3dElem.getAttribute("style");
        if (userStyle) {
            this.canvasDiv.setAttribute("style", userStyle);
            //canvas.setAttribute("style", userStyle);
        }
        x3dElem.parentNode.insertBefore(this.canvasDiv, x3dElem);
        
        // Apply the width and height of the X3D element to the canvas 
        var x, y, w, h;
        if ((x = x3dElem.getAttribute("x")) !== null) {
            canvas.style.left = x.toString();
        }
        if ((y = x3dElem.getAttribute("y")) !== null) {
            canvas.style.top = y.toString();
        }
        if ((w = x3dElem.getAttribute("width")) !== null) {
            canvas.style.width = this.canvasDiv.style.width = w.toString();
			//Attention: pbuffer dim is _not_ derived from style attribs!
			canvas.setAttribute("width",canvas.style.width);
        }
        if ((h = x3dElem.getAttribute("height")) !== null) {
            canvas.style.height = this.canvasDiv.style.height = h.toString();
			//Attention: pbuffer dim is _not_ derived from style attribs!
			canvas.setAttribute("height",canvas.style.height);
        }
        
        // If the X3D element has an id attribute, append "_canvas"
        // to it and and use that as the id for the canvas
        var id = x3dElem.getAttribute("id");
        if (id !== null) {
            this.canvasDiv.id = "x3dom-" + id + "-canvasdiv";
            canvas.id = "x3dom-" + id + "-canvas";
        }
        else {
            // If the X3D element does not have an id... do what?
            // For now check the date for creating a (hopefully) unique id
            var index = new Date().getTime();
            this.canvasDiv.id = "x3dom-" + index + "-canvasdiv";
            canvas.id = "x3dom-" + index + "-canvas";
        }
		
        return canvas;
    };

    this.createStatDiv = function() {
        var statDiv = document.createElement('div');
        statDiv.setAttribute("class", "x3dom-statdiv");
        statDiv.innerHTML = "0 fps";		
        this.canvasDiv.appendChild(statDiv);
        
        statDiv.oncontextmenu = statDiv.onmousedown = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };        
        return statDiv;
    };

    this.x3dElem = x3dElem;
    this.canvasDiv = document.createElement('div');
    this.canvas = this.createHTMLCanvas(x3dElem);
	this.canvas.parent = this;
    this.fps_t0 = new Date().getTime();
    this.gl = this.initContext(this.canvas);
    this.doc = null;
    
    var runtimeEnabled = x3dElem.getAttribute("runtimeEnabled");
    if (runtimeEnabled !== null) {
        this.hasRuntime = (runtimeEnabled.toLowerCase() == "true");
    }
    else {
        this.hasRuntime = x3dElem.hasRuntime;
    }
    if (this.gl === null) {
        this.hasRuntime = false;
    }
    
    this.showStat = x3dElem.getAttribute("showStat");
    this.statDiv = (this.showStat !== null && this.showStat == "true") ? this.createStatDiv() : null;
	
	if (this.canvas !== null && this.gl !== null && this.hasRuntime)
	{
		// event handler for mouse interaction
		this.canvas.mouse_dragging = false;
		this.canvas.mouse_button = 0;
		this.canvas.mouse_drag_x = 0;
		this.canvas.mouse_drag_y = 0;
		
		this.canvas.oncontextmenu = function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
			return false;
		};
		
		this.canvas.addEventListener('mousedown', function (evt) {
			switch(evt.button) {
				case 0:  this.mouse_button = 1; break;	//left
				case 1:  this.mouse_button = 4; break;	//middle
				case 2:  this.mouse_button = 2; break;	//right
				default: this.mouse_button = 0; break;
			}
			this.mouse_drag_x = evt.layerX;
			this.mouse_drag_y = evt.layerY;
			this.mouse_dragging = true;
			
			if (evt.shiftKey) { this.mouse_button = 1; }
			if (evt.ctrlKey)  { this.mouse_button = 4; }
			if (evt.altKey)   { this.mouse_button = 2; }
			
			this.parent.doc.onMousePress(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			this.parent.doc.needRender = true;
			
			window.status=this.id+' DOWN: '+evt.layerX+", "+evt.layerY;
			//window.status=this.id+' DOWN: '+evt.screenX+", "+evt.screenY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('mouseup', function (evt) {
			this.mouse_button = 0;
			this.mouse_dragging = false;
			
			this.parent.doc.onMouseRelease(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			this.parent.doc.needRender = true;
			
			//window.status=this.id+' UP: '+evt.screenX+", "+evt.screenY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('mouseout', function (evt) {
			this.mouse_button = 0;
			this.mouse_dragging = false;
			
			this.parent.doc.onMouseOut(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			this.parent.doc.needRender = true;
			
			//window.status=this.id+' OUT: '+evt.screenX+", "+evt.screenY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('dblclick', function (evt) {
			this.mouse_button = 0;
			this.mouse_drag_x = evt.layerX;
			this.mouse_drag_y = evt.layerY;
			this.mouse_dragging = false;
			
			this.parent.doc.onDoubleClick(this.mouse_drag_x, this.mouse_drag_y);
			this.parent.doc.needRender = true;
			
			window.status=this.id+' DBL: '+evt.layerX+", "+evt.layerY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('mousemove', function (evt) {
			window.status=this.id+' MOVE: '+evt.layerX+", "+evt.layerY;
			
			if (!this.mouse_dragging) {
				return;
            }
			
            this.mouse_drag_x = evt.layerX;
			this.mouse_drag_y = evt.layerY;
			
			if (evt.shiftKey) { this.mouse_button = 1; }
			if (evt.ctrlKey)  { this.mouse_button = 4; }
			if (evt.altKey)   { this.mouse_button = 2; }
			
			this.parent.doc.onDrag(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			this.parent.doc.needRender = true;
			
			//window.status=this.id+' MOVE: '+dx+", "+dy;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('DOMMouseScroll', function (evt) {
			this.mouse_drag_y += 2 * evt.detail;
            
			this.parent.doc.onDrag(this.mouse_drag_x, this.mouse_drag_y, 2);
			this.parent.doc.needRender = true;
			
			window.status=this.id+' SCROLL: '+evt.detail;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
        
        this.canvas.addEventListener('mousewheel', function (evt) {
            this.mouse_drag_y -= 0.1 * evt.wheelDeltaY;
            
			this.parent.doc.onDrag(this.mouse_drag_x, this.mouse_drag_y, 2);
			this.parent.doc.needRender = true;
			
			window.status=this.id+' SCROLL: '+evt.detail;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
	}
};

x3dom.X3DCanvas.prototype.tick = function() 
{    
	var d = new Date().getTime();
	var fps = 1000.0 / (d - this.fps_t0);
	
	this.fps_t0 = d;
	
	try {
		this.doc.advanceTime(d / 1000); 
		if (this.doc.needRender) {
			if (this.statDiv) {
				this.statDiv.textContent = fps.toFixed(2) + ' fps';
		    }
            
			this.doc.needRender = false;    // picking might require another pass
			this.doc.render(this.gl);
		}
		else {
			if (this.statDiv) {
                if (this.doc.lastDownloadCount !== this.doc.downloadCount) {
                    this.statDiv.textContent = 'dlc: ' + this.doc.downloadCount;
                }
                this.doc.lastDownloadCount = this.doc.downloadCount;
			}
		}
	}
	catch (e) {
		x3dom.debug.logException(e);
		throw e;
	}
};

/** Loads the given @p uri.
    @param uri can be a uri or an X3D node
    */
x3dom.X3DCanvas.prototype.load = function(uri, sceneElemPos) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl);
    var x3dCanvas = this;
	
    this.doc.onload = function () {
        x3dom.debug.logInfo("loaded '" + uri + "'");
        
        if (x3dCanvas.hasRuntime)
        {
            setInterval( function() {
                    x3dCanvas.tick();
                }, 
                16	// use typical monitor frequency as bound
            );
        }
        else
        {
            x3dCanvas.tick();
        }
    };
    
    //if (!x3dCanvas.hasRuntime)
    {
        this.x3dElem.render = function() {
            x3dCanvas.doc.render(x3dCanvas.gl);
        };
        this.x3dElem.context = x3dCanvas.gl.ctx3d;
    }
    
    this.doc.onerror = function () { alert('Failed to load X3D document'); };
    this.doc.load(uri, sceneElemPos);
};

// holds the UserAgent feature
x3dom.userAgentFeature = {
	supportsDOMAttrModified: false
};

(function () {

    var onload = function() {

        // Search all X3D elements in the page
        var x3ds = document.getElementsByTagName('X3D');
        var w3sg = document.getElementsByTagName('webSG');

		// active hacky DOMAttrModified workaround to webkit 
		if ( window.navigator.userAgent.match(/webkit/i)) {
			x3dom.debug.logInfo ("Active DOMAttrModifiedEvent workaround for webkit ");
			x3dom.userAgentFeature.supportsDOMAttrModified = false;
		}
			
        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) { n.hasRuntime = true;  return n; });
        w3sg = Array.map(w3sg, function (n) { n.hasRuntime = false; return n; });
        
        var i=0;
        for (i=0; i<w3sg.length; i++) {
            x3ds.push(w3sg[i]);
        }
		
		var activateLog = false;
		for (i=0; i<x3ds.length; i++) {
			var showLog = x3ds[i].getAttribute("showLog");
			if (showLog !== null && showLog.toLowerCase() == "true")
			{
				activateLog = true;
				break;
			}
		}
		
		// Activate debugging/logging for x3dom. Logging will only work for
        // all log calls after this line!
		if (activateLog) {
			x3dom.debug.activate();
		}
        
        if (x3dom.versionInfo !== undefined) {
            x3dom.debug.logInfo("X3Dom version " + x3dom.versionInfo.version + 
                                " Rev. " + x3dom.versionInfo.svnrevision);
        }
        
		x3dom.debug.logInfo("Found " + (x3ds.length - w3sg.length) + 
                " X3D and " + w3sg.length + " (experimental) WebSG nodes...");
        
        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        for (i=0; i<x3ds.length; i++)
        {
        /*
            // http://de.selfhtml.org/javascript/objekte/mimetypes.htm
            if (navigator.mimeTypes["model/vrml"] &&
                navigator.mimeTypes["model/vrml"].enabledPlugin != null)
            {
                alert(navigator.mimeTypes["model/vrml"].suffixes);
                
                var domString, embed;
                //var dom = (new DOMParser()).parseFromString(xmlstring, "text/xml");
                domString = (new XMLSerializer()).serializeToString(x3ds[i].childNodes[1]);
                domString = "<X3D>\n" + domString + "\n</X3D>\n";
                //domString = domString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                //x3dom.debug.logInfo(domString);
                //alert(domString);
                
                embed = document.createElement("embed");
                embed.setAttribute("id", "embed1");
                embed.setAttribute("type", "model/vrml");
                embed.setAttribute("width", x3ds[i].getAttribute("width"));
                embed.setAttribute("height", x3ds[i].getAttribute("height"));
                //embed.setAttribute("src", "flipper.x3d");
                
                x3ds[i].parentNode.insertBefore(embed, x3ds[i]);
                embed.load(domString);
                
                continue;
            }
        */
            
            var x3dcanvas = new x3dom.X3DCanvas(x3ds[i]);
            
			if (x3dcanvas.gl === null)
			{
            /*
                var domString, embed;
                //var dom = (new DOMParser()).parseFromString(xmlstring, "text/xml");
                domString = (new XMLSerializer()).serializeToString(x3ds[i].childNodes[1]);
                domString = "<X3D>\n" + domString + "\n</X3D>\n";
                //domString = domString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                //x3dom.debug.logInfo(domString);
                //alert(domString);
                
                embed = document.createElement("embed");
                embed.setAttribute("id", "embed1");
                embed.setAttribute("type", "model/vrml");
                embed.setAttribute("width", x3dcanvas.canvasDiv.style.width);
                embed.setAttribute("height", x3dcanvas.canvasDiv.style.height);
                //embed.setAttribute("src", "flipper.x3d");
                x3dcanvas.canvasDiv.appendChild(embed);
                embed.load(domString);
                break;
            */
                
                var altDiv = document.createElement("div");
                altDiv.setAttribute("class", "x3dom-nox3d");
                var altP = document.createElement("p");
				altP.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));
				var aLnk = document.createElement("a");
				aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");
				aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));
                
                altDiv.appendChild(altP);
				altDiv.appendChild(aLnk);
                x3dcanvas.canvasDiv.appendChild(altDiv);

                // remove the stats div (it's not needed when WebGL doesnt work)
                if (x3dcanvas.statDiv) { 
                    x3dcanvas.canvasDiv.removeChild(x3dcanvas.statDiv);
                }
                
                // check if "altImg" is specified and if so use it as background
                var altImg = x3ds[i].getAttribute("altImg") || null;
                if (altImg) {
                    var altImgObj = new Image();                
                    altImgObj.src = altImg;                    
                    x3dcanvas.canvasDiv.style.backgroundImage = "url("+altImg+")";                    
                    // PE: Don't resize the canvasDiv to match the alt image here cause the image
                    //     might not be loaded yet and the size would be (0,0). Just do it with CSS..
                    //x3dcanvas.canvasDiv.style.width = altImgObj.width + "px";
                    //x3dcanvas.canvasDiv.style.height = altImgObj.height + "px";   
                }
                
				continue;
			}
			
            var t0 = new Date().getTime();
            
            x3dcanvas.load(x3ds[i], i);
            x3dom.canvases.push(x3dcanvas);
            
            var t1 = new Date().getTime() - t0;
            x3dom.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
        }
        
        var ready = (function(eventType)
        {
            var evt = null;
            
            if (document.createEvent)
            {
                evt = document.createEvent("Events");    
                evt.initEvent(eventType, true, true);     
                document.dispatchEvent(evt);              
            }
            else if (document.createEventObject)   
            {
                evt = document.createEventObject();
                document.fireEvent('on' + eventType, evt);   
            }
        })('load');
    };
    
    var onunload = function() {
        for (var i=0; i<x3dom.canvases.length; i++) {
            x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);
        }
    };

    window.addEventListener('load', onload, false);
    window.addEventListener('unload', onunload, false);
    window.addEventListener('reload', onunload, false);
    
    document.onkeypress = function(evt) {
        for (var i=0; i<x3dom.canvases.length; i++) {
            if (x3dom.canvases[i].hasRuntime) {
                x3dom.canvases[i].doc.onKeyPress(evt.charCode);
				x3dom.canvases[i].doc.needRender = true;
            }
        }
        return true;
    };
    
    if (window.location.pathname.lastIndexOf(".xhtml") > 0) {
        document.__getElementById = document.getElementById;
        
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
            	var elems = this.getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
    }

})();
