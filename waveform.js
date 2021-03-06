(function() {
  var JSONP, Waveform,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Waveform = Waveform = (function() {

    Waveform.name = 'Waveform';

    function Waveform(options) {
      this.redraw = __bind(this.redraw, this);
      this.container = options.container;
      this.canvas = options.canvas;
      this.data = options.data || [];
        this.lastDrawn = 0;
        this.stream = null;
        this.fullyLoadedDrawn = false;
      this.outerColor = options.outerColor || "transparent";
      this.innerColor = options.innerColor || "#000000";
      this.interpolate = true;
      if (options.interpolate === false) {
        this.interpolate = false;
      }
      if (this.canvas == null) {
        if (this.container) {
          this.canvas = this.createCanvas(this.container, options.width || this.container.clientWidth, options.height || this.container.clientHeight);
        } else {
          throw "Either canvas or container option must be passed";
        }
      }
      //this.patchCanvasForIE(this.canvas);
      this.context = this.canvas.getContext("2d");
      this.width = parseInt(this.context.canvas.width, 10);
      this.height = parseInt(this.context.canvas.height, 10);
      if (options.data) {
        this.update(options);
      }
    }

    Waveform.prototype.setData = function(data) {
      return this.data = data;
    };

    Waveform.prototype.setDataInterpolated = function(data) {
      return this.setData(this.interpolateArray(data, this.width));
    };

    Waveform.prototype.setDataCropped = function(data) {
      return this.setData(this.expandArray(data, this.width));
    };

    Waveform.prototype.update = function(options) {
      if (options.interpolate != null) {
        this.interpolate = options.interpolate;
      }
      if (this.interpolate === false) {
        this.setDataCropped(options.data);
      } else {
        this.setDataInterpolated(options.data);
      }
        this.clear();
        return this.redraw();
    };

    Waveform.prototype.redraw = function() {
        
      var d, i, middle, t, _i, _len, _ref, _results;
      if (typeof this.innerColor === "function") {
        this.context.fillStyle = this.innerColor();
      } else {
        this.context.fillStyle = this.innerColor;
      }
        
        //$('#currentTime').text(this.streamPosition());
      middle = this.height / 2;
      i = this.lastDrawn - 1;
      _ref = this.data;
      _results = [];
      for (_i = (this.lastDrawn - 1), _len = _ref.length; _i < _len; _i++) {
        d = _ref[_i];
        t = this.width / this.data.length;
        if (typeof this.innerColor === "function") {
          this.context.fillStyle = this.innerColor(i / this.width, d);
        }
          if(typeof this.loaded === "function" && this.loaded() && this.fullyLoadedDrawn) {
              if (this.played(i / this.width)) {
                  this.lastDrawn = i;

                  if (typeof this.innerColor === "function") {this.context.fillStyle = this.innerColor(i / this.width, d);}
                  this.context.clearRect(t * i, middle - (middle * d), t, middle * d * 1.6);
                  this.context.fillRect(t * i, middle - (middle * d), t, middle * d * 1);
                  if (typeof this.innerColor === "function") {this.context.fillStyle = this.innerColor(i / this.width, d, 2);}
                  this.context.fillRect(t * i, middle + 1, t, middle * d * 0.5);
                  _results.push(i++);
              }
              else {
                  break;
              }
          }
          else {
            if (typeof this.innerColor === "function") {this.context.fillStyle = this.innerColor(i / this.width, d);}
              this.context.clearRect(t * i, middle - middle * d, t, middle * d * 1.6);
              this.context.fillRect(t * i, middle - middle * d, t, middle * d * 1);
              if (typeof this.innerColor === "function") {this.context.fillStyle = this.innerColor(i / this.width, d, 2);}
              this.context.fillRect(t * i, middle + 1, t, middle * d * 0.5);
              _results.push(i++);
              if(i == (_len-1) && this.loaded())
                this.fullyLoadedDrawn = true;
          }
      }
      return _results;
    };

    Waveform.prototype.clear = function() {
      this.context.clearRect(0, 0, this.width, this.height);
    };

    Waveform.prototype.patchCanvasForIE = function(canvas) {
      var oldGetContext;
      if (typeof window.G_vmlCanvasManager !== "undefined") {
        canvas = window.G_vmlCanvasManager.initElement(canvas);
        oldGetContext = canvas.getContext;
        return canvas.getContext = function(a) {
          var ctx;
          ctx = oldGetContext.apply(canvas, arguments);
          canvas.getContext = oldGetContext;
          return ctx;
        };
      }
    };

    Waveform.prototype.createCanvas = function(container, width, height) {
      var canvas;
      canvas = document.createElement("canvas");
      container.appendChild(canvas);
      canvas.width = width;
      canvas.height = height;
      return canvas;
    };

    Waveform.prototype.expandArray = function(data, limit, defaultValue) {
      var i, newData, _i, _ref;
      if (defaultValue == null) {
        defaultValue = 0.0;
      }
      newData = [];
      if (data.length > limit) {
        newData = data.slice(data.length - limit, data.length);
      } else {
        for (i = _i = 0, _ref = limit - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          newData[i] = data[i] || defaultValue;
        }
      }
      return newData;
    };

    Waveform.prototype.linearInterpolate = function(before, after, atPoint) {
      return before + (after - before) * atPoint;
    };

    Waveform.prototype.interpolateArray = function(data, fitCount) {
      var after, atPoint, before, i, newData, springFactor, tmp;
      newData = new Array();
      springFactor = new Number((data.length - 1) / (fitCount - 1));
      newData[0] = data[0];
      i = 1;
      while (i < fitCount - 1) {
        tmp = i * springFactor;
        before = new Number(Math.floor(tmp)).toFixed();
        after = new Number(Math.ceil(tmp)).toFixed();
        atPoint = tmp - before;
        newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
        i++;
      }
      newData[fitCount - 1] = data[data.length - 1];
      return newData;
    };

    Waveform.prototype.optionsForSyncedStream = function(options) {
      var innerColorWasSet, that;
      if (options == null) {
          options = {};
          innerColorWasSet = false;
      }
      that = this;
      return {
        whileplaying: this.redraw,
        whileloading: function() {
          if (!innerColorWasSet) {
              stream = this;
            that.innerColor = function(x, y, z) {
              if (x <= stream.position / stream.durationEstimate) {
                return (z == 2) ? "rgba(255,255,255,0.35)" : "rgba(255,255,255, 0.75)";
              } else if (x < stream.bytesLoaded / stream.bytesTotal) {
                return (z == 2) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255, 0.3)";
              } else {
                return (z == 2) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255, 0.1)";
              }
            };
              that.loaded = function() {
                  return (stream.bytesLoaded >= stream.bytesTotal);
              };
              that.played = function(x) {
                  return (x <= (stream.position + 100) / stream.durationEstimate);
              };
              that.streamPosition = function () {
                  return stream.position;
              };
            innerColorWasSet = true;
          }
          return this.redraw;
        }
      };
    };

    Waveform.prototype.dataFromSoundCloudTrack = function(track) {
      var _this = this;
      return JSONP.get("http://www.waveformjs.org/w", {
        url: track.waveform_url
      }, function(data) {
        return _this.update({
          data: data
        });
      });
    };

    return Waveform;

  })();

  JSONP = (function() {
    var config, counter, encode, head, jsonp, key, load, query, setDefaults, window;
    load = function(url) {
      var done, head, script;
      script = document.createElement("script");
      done = false;
      script.src = url;
      script.async = true;
      script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
          done = true;
          script.onload = script.onreadystatechange = null;
          if (script && script.parentNode) {
            return script.parentNode.removeChild(script);
          }
        }
      };
      if (!head) {
        head = document.getElementsByTagName("head")[0];
      }
      return head.appendChild(script);
    };
    encode = function(str) {
      return encodeURIComponent(str);
    };
    jsonp = function(url, params, callback, callbackName) {
      var key, query, uniqueName;
      query = ((url || "").indexOf("?") === -1 ? "?" : "&");
      callbackName = callbackName || config["callbackName"] || "callback";
      uniqueName = callbackName + "_json" + (++counter);
      params = params || {};
      for (key in params) {
        if (params.hasOwnProperty(key)) {
          query += encode(key) + "=" + encode(params[key]) + "&";
        }
      }
      window[uniqueName] = function(data) {
        callback(data);
        try {
          delete window[uniqueName];
        } catch (_error) {}
        return window[uniqueName] = null;
      };
      load(url + query + callbackName + "=" + uniqueName);
      return uniqueName;
    };
    setDefaults = function(obj) {
      var config;
      return config = obj;
    };
    counter = 0;
    head = void 0;
    query = void 0;
    key = void 0;
    window = this;
    config = {};
    return {
      get: jsonp,
      init: setDefaults
    };
  })();

}).call(this);
