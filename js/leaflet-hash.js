//leaflet-hash (https://github.com/calvinmetcalf/leaflet-hash)
(function() {

  L.Hash = L.Class.extend({
    initialize: function(map, options) {
      this.map = map;
      this.options = options || {};
      if (!this.options.path) {
        if (this.options.lc) {
          this.options.path = '{base}/{z}/{lat}/{lng}';
        } else {
          this.options.path = '{z}/{lat}/{lng}';
        }
      }
      if (this.options.lc && !this.options.formatBase) {
        this.options.formatBase = [
          /[\s\:A-Z]/g, function(match) {
            if (match.match(/\s/)) {
              return "_";
            } else if (match.match(/\:/)) {
              return "";
            }
            if (match.match(/[A-Z]/)) {
              return match.toLowerCase();
            }
          }
        ];
      }if (location.hash) {
        this.updateFromState(this.parseHash(location.hash));//sets the view
        const pstate = this.formatState();
        history.replaceState.apply(history, pstate);//write current location to browser history cache (for back button)
      }
      if (this.map._loaded) {
        return this.startListning();
      } else {
        return this.map.on("load", this.startListning,this);
      }
    },
    startListning: function() {
      var onHashChange,
        _this = this;
      if (location.hash) {
        this.updateFromState(this.parseHash(location.hash));
      }
      if (history.pushState) {
        if (!location.hash) {
          history.replaceState.apply(history, this.formatState());
        }
        window.onpopstate = function(event) {
          
          if (event.state) {
            return _this.updateFromState(event.state);
          }
        };
        this.map.on("moveend", function() {
          var pstate;
          pstate = _this.formatState();
          if (location.hash !== pstate[2] && !_this.moving) {
            return history.pushState.apply(history, pstate);
          }
        });
      } else {
        if (!location.hash) {
          location.hash = this.formatState()[2];
        }
        onHashChange = function() {
          
          var pstate;
          pstate = _this.formatState();
          if (location.hash !== pstate[2] && !_this.moving) {
            return location.hash = pstate[2];
          }
        };
        this.map.on("moveend", onHashChange);
        if (('onhashchange' in window) && (window.documentMode === void 0 || window.documentMode > 7)) {
          window.onhashchange = function() {
            if (location.hash) {
              
              return _this.updateFromState(_this.parseHash(location.hash));
            }
          };
        } else {
          this.hashChangeInterval = setInterval(onHashChange, 50);
        }
      }
      return this.map.on("baselayerchange", function(e) {
        var pstate, _ref;
        _this.base = (_ref = _this.options.lc._layers[e.layer._leaflet_id].name).replace.apply(_ref, _this.options.formatBase);
        pstate = _this.formatState();
        if (history.pushState) {
          if (location.hash !== pstate[2] && !_this.moving) {
            return history.pushState.apply(history, pstate);
          }
        } else {
          if (location.hash !== pstate[2] && !_this.moving) {
            return location.hash = pstate[2];
          }
        }
      });
    },
    parseHash: function(hash) {
       
      var args, lat, latIndex, lngIndex, lon, out, path, zIndex, zoom;
      path = this.options.path.split("/");
      zIndex = path.indexOf("{z}");
      latIndex = path.indexOf("{lat}");
      lngIndex = path.indexOf("{lng}");
      if (hash.indexOf("#") === 0) {
        hash = hash.substr(1);
      }
      args = hash.split("/");
 
      if (args.length > 2) {
        zoom = parseInt(args[zIndex], 10);
        lat = parseFloat(args[latIndex]);
        lon = parseFloat(args[lngIndex]);
        if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
          return false;
        } else {
          out = {
            center: new L.LatLng(lat, lon),
            zoom: zoom
          };
          if (args.length > 3) {
            out.base = args[path.indexOf("{base}")];
            return out;
          } else {
            return out;
          }
        }
      } else {
         
        return false;
      }
    },
    updateFromState: function(state) {
      if (this.moving || !state) {
        return;
      }
      this.moving = true;
      this.map.setView(state.center, state.zoom);
      if (state.base) {
        this.setBase(state.base);
      }
      this.moving = false;
      return true;
    },
    formatState: function() {
      var center, precision, state, template, zoom;
      center = this.map.getCenter();
      zoom = this.map.getZoom();
      precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
      state = {
        center: center,
        zoom: zoom
      };
      template = {
        lat: center.lat.toFixed(precision),
        lng: center.lng.toFixed(precision),
        z: zoom
      };
      if (this.options.path.indexOf("{base}") > -1) {
        state.base = this.getBase();
        template.base = state.base;
      }
      return [state, "a", '#' + L.Util.template(this.options.path, template)];
    },
    setBase: function(base) {
      var i, inputs, len, _ref;
      this.base = base;
      inputs = this.options.lc._form.getElementsByTagName('input');
      len = inputs.length;
      i = 0;
      while (i < len) {
        if (inputs[i].name === 'leaflet-base-layers' && (_ref = this.options.lc._layers[inputs[i].layerId].name).replace.apply(_ref, this.options.formatBase) === base) {
          inputs[i].checked = true;
          this.options.lc._onInputClick();
          return true;
        }
        i++;
      }
    },
    getBase: function() {
      var i, inputs, len, _ref;
      if (this.base) {
        return this.base;
      }
      inputs = this.options.lc._form.getElementsByTagName('input');
      len = inputs.length;
      i = 0;
      while (i < len) {
        if (inputs[i].name === 'leaflet-base-layers' && inputs[i].checked) {
          this.base = (_ref = this.options.lc._layers[inputs[i].layerId].name).replace.apply(_ref, this.options.formatBase);
          return this.base;
        }
      }
      return false;
    },
    remove: function() {
      this.map.off("moveend");
      if (window.onpopstate) {
        window.onpopstate = null;
      }
      location.hash = "";
      return clearInterval(this.hashChangeInterval);
    }
  });

  L.hash = function(map, options) {
    return new L.Hash(map, options);
  };

  L.Map.include({
    addHash: function(options) {
  
        this._hash = L.hash(this, options);
    
      return this;
    },
    removeHash: function() {
      this._hash.remove();
      return this;
    }
  });

}).call(this);