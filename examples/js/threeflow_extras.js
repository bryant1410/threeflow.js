(function() {
  var DatGUI, LightingBox, LightingRig,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.THREEFLOW = window.THREEFLOW || {};

  THREEFLOW.DatGui = DatGUI = (function() {
    function DatGUI(renderer) {
      var updateFolder, updateType,
        _this = this;
      this.renderer = renderer;
      this._onRender = __bind(this._onRender, this);
      if (!window.dat && !window.dat.GUI) {
        throw new Error("No dat.GUI found.");
      }
      dat.GUI.prototype.removeFolder = function(name) {
        console.log("REMOVE", this, name);
        this.__folders[name].close();
        this.__ul.removeChild(this.__folders[name].li);
        dom.removeClass(this.__folders[name].li, 'folder');
        this.__folders[name] = void 0;
        return this.onResize();
      };
      this.gui = new dat.GUI();
      this.onRender = null;
      this.gui.add(this, "_onRender").name("Render");
      this.gui.add(this.renderer, "scale");
      this.imageFolder = this.gui.addFolder("Image");
      this.bucketFolder = this.gui.addFolder("Bucket Size/Order");
      this.traceDepthsFolder = this.gui.addFolder("Trace Depths");
      this.causticsFolder = this.gui.addFolder("Caustics");
      this.giFolder = this.gui.addFolder("Global Illumination");
      this.otherFolder = this.gui.addFolder("Other Options");
      this.imageFolder.add(this.renderer.image, "antialiasMin");
      this.imageFolder.add(this.renderer.image, "antialiasMax");
      this.imageFolder.add(this.renderer.image, "samples");
      this.imageFolder.add(this.renderer.image, "contrast");
      this.imageFolder.add(this.renderer.image, "filter", this.renderer.image.filterTypes);
      this.imageFolder.add(this.renderer.image, "jitter");
      this.bucketFolder.add(this.renderer.bucket, "enabled");
      this.bucketFolder.add(this.renderer.bucket, "size");
      this.bucketFolder.add(this.renderer.bucket, "order", this.renderer.bucket.orderTypes);
      this.bucketFolder.add(this.renderer.bucket, "reverse");
      this.traceDepthsFolder.add(this.renderer.traceDepths, "enabled");
      this.traceDepthsFolder.add(this.renderer.traceDepths, "diffusion");
      this.traceDepthsFolder.add(this.renderer.traceDepths, "reflection");
      this.traceDepthsFolder.add(this.renderer.traceDepths, "refraction");
      this.causticsFolder.add(this.renderer.caustics, "enabled");
      this.causticsFolder.add(this.renderer.caustics, "photons");
      this.causticsFolder.add(this.renderer.caustics, "kdEstimate");
      this.causticsFolder.add(this.renderer.caustics, "kdRadius");
      this.otherFolder.add(this.renderer.meshes, "convertPrimitives");
      this.otherFolder.add(this.renderer.geometry, "normals").name("geomNormals");
      this.otherFolder.add(this.renderer.bufferGeometry, "normals").name("bufferGeomNormals");
      this.giFolder.add(this.renderer.gi, "enabled");
      this.giFolder.add(this.renderer.gi, "type", this.renderer.gi.types).onChange(function(value) {
        return updateType(value);
      });
      this.giTypes = [
        {
          type: this.renderer.gi.types[0],
          name: "Instant GI",
          property: "igi"
        }, {
          type: this.renderer.gi.types[1],
          name: "Irradiance Caching / Final Gathering",
          property: "irrCache"
        }, {
          type: this.renderer.gi.types[2],
          name: "Path Tracing",
          property: "path"
        }, {
          type: this.renderer.gi.types[3],
          name: "Ambient Occlusion",
          property: "ambOcc"
        }, {
          type: this.renderer.gi.types[4],
          name: "Fake Ambient Term",
          property: "fake"
        }
      ];
      this.giSubFolder = null;
      updateFolder = function(type) {
        var controller, controllers, property, _i, _len;
        if (!_this.giSubFolder) {
          _this.giSubFolder = _this.giFolder.addFolder(type.name);
        } else {
          controllers = _this.giSubFolder.__controllers.slice(0);
          for (_i = 0, _len = controllers.length; _i < _len; _i++) {
            controller = controllers[_i];
            _this.giSubFolder.remove(controller);
          }
          _this.giSubFolder.__controllers.splice(0);
          _this.giSubFolder.__ul.firstChild.innerHTML = type.name;
        }
        for (property in _this.renderer.gi[type.property]) {
          if (type.type === "irr-cache" && property === "globalMap") {
            _this.giSubFolder.add(_this.renderer.gi.irrCache, "globalMap", _this.renderer.gi.globalMapTypes);
          } else if (type.type === "ambocc" && (property === "bright" || property === "dark")) {
            _this.giSubFolder.addColor(_this.renderer.gi[type.property], property);
          } else if (type.type === "fake") {
            console.log("SKIPPED FAKE AMBIENT TERM GI(TODO)");
          } else {
            _this.giSubFolder.add(_this.renderer.gi[type.property], property);
          }
        }
        return null;
      };
      updateType = function(type) {
        _this.renderer.gi.type = type;
        updateFolder(_this.giTypes[_this.renderer.gi.types.indexOf(type)]);
        return null;
      };
      updateType(this.renderer.gi.type);
      null;
    }

    DatGUI.prototype._onRender = function() {
      if (this.onRender) {
        return this.onRender();
      }
    };

    /*
    _onPreview:()=>
      if @onPreview
        @onPreview()
    */


    return DatGUI;

  })();

  THREEFLOW.LightingBox = LightingBox = (function() {
    function LightingBox(params) {
      var backward, blue, down, forward, geometry, green, left, materials, red, right, scaleX, scaleY, scaleZ, segments, size, size2, up, white, yellow;
      if (params == null) {
        params = {};
      }
      THREE.Object3D.call(this);
      size = params.size || 100;
      segments = params.segments || 2;
      scaleX = params.scaleX || 1;
      scaleY = params.scaleY || 1;
      scaleZ = params.scaleZ || 1;
      materials = params.materials || null;
      if (!materials || materials.length < 6) {
        red = new THREEFLOW.DiffuseMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide
        });
        green = new THREEFLOW.DiffuseMaterial({
          color: 0x00ff00,
          side: THREE.DoubleSide
        });
        blue = new THREEFLOW.DiffuseMaterial({
          color: 0x0000ff,
          side: THREE.DoubleSide
        });
        yellow = new THREEFLOW.DiffuseMaterial({
          color: 0xffff00,
          side: THREE.DoubleSide
        });
        white = new THREEFLOW.DiffuseMaterial({
          color: 0xfafafa,
          side: THREE.DoubleSide
        });
        materials = [white, white, red, green, blue, yellow];
      }
      geometry = new THREE.PlaneGeometry(size, size, segments, segments);
      up = new THREE.Mesh(geometry, materials[0]);
      down = new THREE.Mesh(geometry, materials[1]);
      left = new THREE.Mesh(geometry, materials[2]);
      right = new THREE.Mesh(geometry, materials[3]);
      forward = new THREE.Mesh(geometry, materials[4]);
      backward = new THREE.Mesh(geometry, materials[5]);
      size2 = size / 2;
      up.position.set(0, size, 0);
      up.rotation.x = down.rotation.x = Math.PI / 2;
      down.position.set(0, 0, 0);
      left.position.set(-size2, size2, 0);
      right.position.set(size2, size2, 0);
      left.rotation.y = right.rotation.y = Math.PI / 2;
      forward.position.set(0, size2, size2);
      backward.position.set(0, size2, -size2);
      this.add(up);
      this.add(down);
      this.add(left);
      this.add(right);
      this.add(forward);
      this.add(backward);
      this.scale.x = scaleX;
      this.scale.y = scaleY;
      this.scale.z = scaleZ;
    }

    LightingBox.prototype = Object.create(THREE.Object3D.prototype);

    return LightingBox;

  })();

  THREEFLOW.LightingRig = LightingRig = (function() {
    function LightingRig(params) {
      var focus, geometry, light1, light2, material, mesh;
      if (params == null) {
        params = {};
      }
      THREE.Object3D.call(this);
      params.backdropWall = params.backdropWall || 600;
      params.backdropFloor = params.backdropFloor || 1500;
      params.backdropCurve = params.backdropCurve || 400;
      params.backdropCurveSteps = params.backdropCurveSteps || 20;
      focus = new THREE.Vector3();
      geometry = this.createBackdropGeometry(params.backdropWall, params.backdropFloor, params.backdropCurve, params.backdropCurveSteps);
      material = new THREE.MeshLambertMaterial({
        color: 0xefefef,
        ambient: 0xffffff,
        side: THREE.DoubleSide
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -(Math.PI / 2);
      mesh.position.z = params.backdropFloor / 2;
      this.add(mesh);
      light1 = new THREEFLOW.AreaLight({
        radiance: 5,
        geometry: new THREE.PlaneGeometry(200, 200)
      });
      light1.position.set(-200, 200, 200);
      light1.lookAt(focus);
      light2 = new THREEFLOW.AreaLight({
        radiance: 5,
        geometry: new THREE.PlaneGeometry(200, 200)
      });
      light2.position.set(200, 400, 200);
      light2.lookAt(focus);
      this.add(light1);
      this.add(light2);
    }

    LightingRig.prototype = Object.create(THREE.Object3D.prototype);

    LightingRig.prototype.createBackdropGeometry = function(wall, floor, curve, curveSteps) {
      var PI2, angle, geometry, points, x, z, _i, _ref, _ref1, _ref2;
      points = [];
      points.push(new THREE.Vector3());
      PI2 = Math.PI / 2;
      for (angle = _i = _ref = Math.PI, _ref1 = Math.PI - PI2, _ref2 = -(PI2 / curveSteps); _ref2 > 0 ? _i < _ref1 : _i > _ref1; angle = _i += _ref2) {
        x = (Math.sin(angle) * curve) + floor;
        z = (Math.cos(angle) * curve) + curve;
        points.push(new THREE.Vector3(x, 0, z));
      }
      points.push(new THREE.Vector3(floor + curve, 0, curve + wall));
      geometry = new THREE.LatheGeometry(points, 12, 0, Math.PI);
      return geometry;
    };

    return LightingRig;

  })();

}).call(this);
