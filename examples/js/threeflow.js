(function() {
  var AreaLight, BlockExporter, BucketExporter, BufferGeometryExporter, CameraExporter, CausticsExporter, ConstantMaterial, DiffuseMaterial, Exporter, GeometryExporter, GiExporter, GlassMaterial, ImageExporter, LightsExporter, MaterialsExporter, MeshExporter, MirrorMaterial, PhongMaterial, PointLight, ShinyMaterial, SunflowRenderer, SunskyLight, TraceDepthsExporter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.THREEFLOW = window.THREEFLOW || {};

  THREEFLOW.SunflowRenderer = SunflowRenderer = (function() {
    function SunflowRenderer(options) {
      this.onRenderComplete = __bind(this.onRenderComplete, this);
      this.onRenderProgress = __bind(this.onRenderProgress, this);
      this.onRenderStart = __bind(this.onRenderStart, this);
      this.onConnected = __bind(this.onConnected, this);
      options = options || {};
      this.pngPath = options.pngPath || null;
      this.scPath = options.scPath || null;
      this.scSave = options.scSave || false;
      this.scale = options.scale || 1;
      this.exporter = new Exporter();
      this.image = this.exporter.image;
      this.bucket = this.exporter.bucket;
      this.traceDepths = this.exporter.traceDepths;
      this.caustics = this.exporter.caustics;
      this.gi = this.exporter.gi;
      this.cameras = this.exporter.cameras;
      this.lights = this.exporter.lights;
      this.materials = this.exporter.materials;
      this.geometry = this.exporter.geometry;
      this.bufferGeometry = this.exporter.bufferGeometry;
      this.meshes = this.exporter.meshes;
      this.connected = false;
      this.rendering = false;
    }

    SunflowRenderer.prototype.connect = function() {
      if (this.connected) {
        return;
      }
      this.socket = io.connect(this.host);
      this.socket.on('connected', this.onConnected);
      this.socket.on('render-start', this.onRenderStart);
      this.socket.on('render-progress', this.onRenderProgress);
      this.socket.on('render-complete', this.onRenderComplete);
      return null;
    };

    SunflowRenderer.prototype.render = function(scene, camera, width, height) {
      var scContents;
      if (!this.connected) {
        throw new Error("[SunflowRenderer] Call connect() before rendering.");
      } else if (!this.rendering) {
        this.rendering = true;
        console.log("RENDER");
        this.exporter.image.resolutionX = width * this.scale;
        this.exporter.image.resolutionY = height * this.scale;
        this.exporter.indexScene(scene);
        scContents = this.exporter.exportCode();
        this.socket.emit("render", {
          scContents: scContents,
          scPath: this.scPath,
          scSave: this.scSave,
          pngPath: this.pngPath
        });
      } else {
        console.log("[Render in Progress]");
      }
      return null;
    };

    SunflowRenderer.prototype.onConnected = function(data) {
      console.log("Threeflow conected.");
      this.connected = true;
      return null;
    };

    SunflowRenderer.prototype.onRenderStart = function(data) {
      console.log("onRenderStart");
      return null;
    };

    SunflowRenderer.prototype.onRenderProgress = function(data) {
      console.log("onRenderProgress", data);
      return null;
    };

    SunflowRenderer.prototype.onRenderComplete = function(data) {
      this.rendering = false;
      console.log("onRenderComplete", data);
      return null;
    };

    return SunflowRenderer;

  })();

  BlockExporter = (function() {
    function BlockExporter(exporter) {
      this.exporter = exporter;
    }

    BlockExporter.prototype.addToIndex = function(object3d) {
      throw new Error('BlockExporter subclasses must override this method.');
    };

    BlockExporter.prototype.doTraverse = function(object3d) {
      throw new Error('BlockExporter subclasses must override this method.');
    };

    BlockExporter.prototype.exportBlock = function() {
      throw new Error('BlockExporter subclasses must override this method.');
    };

    BlockExporter.prototype.exportColorTHREE = function(color) {
      return '{ "sRGB nonlinear" ' + color.r + ' ' + color.g + ' ' + color.b + ' }';
    };

    BlockExporter.prototype.exportColorHex = function(hex) {
      var b, g, r;
      r = (hex >> 16 & 0xff) / 255;
      g = (hex >> 8 & 0xff) / 255;
      b = (hex & 0xff) / 255;
      return '{ "sRGB nonlinear" ' + r + ' ' + g + ' ' + b + ' }';
    };

    BlockExporter.prototype.exportVector = function(vector) {
      return vector.x + " " + vector.y + " " + vector.z;
    };

    BlockExporter.prototype.exportFace = function(face) {
      return face.a + " " + face.b + " " + face.c;
    };

    BlockExporter.prototype.exportTransform = function(object3d) {
      var element, result, _i, _len, _ref;
      result = '';
      _ref = object3d.matrixWorld.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        result += ' ' + element;
      }
      return result;
    };

    BlockExporter.prototype.exportTransformPosition = function(object3d) {
      var elements, result;
      result = '';
      elements = object3d.matrixWorld.elements;
      result += elements[12] + ' ' + elements[13] + ' ' + elements[14];
      return result;
    };

    return BlockExporter;

  })();

  BucketExporter = (function(_super) {
    __extends(BucketExporter, _super);

    BucketExporter.ORDER_TYPES = ['hilbert', 'spiral', 'column', 'row', 'diagonal', 'random'];

    function BucketExporter(exporter) {
      BucketExporter.__super__.constructor.call(this, exporter);
      this.orderTypes = BucketExporter.ORDER_TYPES;
      this.enabled = true;
      this.reverse = false;
      this.size = 64;
      this.order = this.orderTypes[0];
    }

    BucketExporter.prototype.addToIndex = function(object3d) {
      return null;
    };

    BucketExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    BucketExporter.prototype.exportBlock = function() {
      var bucket, result;
      result = '';
      if (!this.enabled) {
        return result;
      }
      bucket = this.size + ' ';
      if (this.reverse) {
        bucket += '"reverse ' + this.order + '"';
      } else {
        bucket += this.order;
      }
      result += 'bucket ' + bucket + '\n';
      return result;
    };

    return BucketExporter;

  })(BlockExporter);

  BufferGeometryExporter = (function(_super) {
    __extends(BufferGeometryExporter, _super);

    function BufferGeometryExporter(exporter) {
      BufferGeometryExporter.__super__.constructor.call(this, exporter);
      this.normals = true;
      this.uvs = false;
      this.bufferGeometryIndex = {};
    }

    BufferGeometryExporter.prototype.addToIndex = function(object3d) {
      if (!object3d instanceof THREE.Mesh) {
        return;
      }
      if (object3d.geometry instanceof THREE.BufferGeometry && !this.bufferGeometryIndex[object3d.geometry.uuid]) {
        this.bufferGeometryIndex[object3d.geometry.uuid] = {
          geometry: object3d.geometry,
          faceMaterials: false
        };
      }
      return null;
    };

    BufferGeometryExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    BufferGeometryExporter.prototype.exportBlock = function() {
      var attributes, entry, face, i, index, indices, normals, offset, offsets, positions, result, result2, tris, uuid, _i, _j, _k, _l, _len, _len1, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      result = '';
      for (uuid in this.bufferGeometryIndex) {
        entry = this.bufferGeometryIndex[uuid];
        result += 'object {\n';
        result += '  noinstance\n';
        result += '  type generic-mesh\n';
        result += '  name ' + uuid + '\n';
        offsets = entry.geometry.offsets;
        attributes = entry.geometry.attributes;
        positions = attributes.position.array;
        normals = attributes.normal.array;
        result += '  points ' + (positions.length / 3) + '\n';
        for (i = _i = 0, _ref = positions.length; _i < _ref; i = _i += 3) {
          result += '    ' + positions[i] + ' ' + positions[i + 1] + ' ' + positions[i + 2] + '\n';
        }
        if (attributes.index) {
          indices = attributes.index.array;
          if (offsets.length) {
            tris = 0;
            result2 = '';
            for (_j = 0, _len = offsets.length; _j < _len; _j++) {
              offset = offsets[_j];
              index = offset.index;
              for (i = _k = _ref1 = offset.start, _ref2 = offset.start + offset.count; _k < _ref2; i = _k += 3) {
                tris++;
                result2 += '    ' + (indices[i] + index) + ' ' + (indices[i + 1] + index) + ' ' + (indices[i + 2] + index) + '\n';
              }
            }
            result += '  triangles ' + tris + '\n';
            result += result2;
          } else {
            result += '  triangles ' + (indices.length / 3) + '\n';
            for (i = _l = 0, _ref3 = indices.length; _l < _ref3; i = _l += 3) {
              result += '    ' + indices[i] + ' ' + indices[i + 1] + ' ' + indices[i + 2] + '\n';
            }
          }
        } else {
          result += '  triangles ' + (positions.length / 9) + '\n';
          for (i = _m = 0, _ref4 = positions.length / 3; _m < _ref4; i = _m += 3) {
            result += '    ' + i + ' ' + (i + 1) + ' ' + (i + 2) + '\n';
          }
        }
        if (this.normals && normals.length > 0) {
          result += '  normals vertex\n';
          for (i = _n = 0, _ref5 = normals.length; _n < _ref5; i = _n += 3) {
            result += '    ' + normals[i] + ' ' + normals[i + 1] + ' ' + normals[i + 2] + '\n';
          }
          result += '\n';
        } else {
          result += '  normals none\n';
        }
        if (this.uvs) {
          result += '  uvs none\n';
        } else {
          result += '  uvs none\n';
        }
        if (entry.faceMaterials) {
          result += '  face_shaders\n';
          _ref6 = entry.geometry.faces;
          for (_o = 0, _len1 = _ref6.length; _o < _len1; _o++) {
            face = _ref6[_o];
            result += '    ' + face.materialIndex + '\n';
          }
        }
        result += '}\n\n';
      }
      return result;
    };

    return BufferGeometryExporter;

  })(BlockExporter);

  CameraExporter = (function(_super) {
    __extends(CameraExporter, _super);

    function CameraExporter(exporter) {
      CameraExporter.__super__.constructor.call(this, exporter);
      this.helperVec = new THREE.Vector3();
      this.camera = null;
    }

    CameraExporter.prototype.addToIndex = function(object3d) {
      if (this.camera) {
        return;
      }
      if (object3d instanceof THREE.PerspectiveCamera) {
        this.camera = object3d;
        console.log("SET CAMERA", this.camera);
      }
      return null;
    };

    CameraExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    CameraExporter.prototype.exportBlock = function() {
      var result;
      result = '';
      if (!this.camera) {
        return result;
      }
      result += 'camera {\n';
      result += '  type pinhole\n';
      this.helperVec.copy(this.camera.position);
      this.helperVec.applyMatrix4(this.camera.matrixWorld);
      result += '  eye ' + this.exportVector(this.camera.position) + '\n';
      this.helperVec.set(0, 0, -1);
      this.helperVec.applyMatrix4(this.camera.matrixWorld);
      result += '  target ' + this.exportVector(this.helperVec) + '\n';
      result += '  up ' + this.exportVector(this.camera.up) + '\n';
      result += '  fov ' + this.camera.fov * this.camera.aspect + '\n';
      result += '  aspect ' + this.camera.aspect + '\n';
      result += '}\n\n';
      return result;
    };

    return CameraExporter;

  })(BlockExporter);

  CausticsExporter = (function(_super) {
    __extends(CausticsExporter, _super);

    function CausticsExporter(exporter) {
      CausticsExporter.__super__.constructor.call(this, exporter);
      this.enabled = false;
      this.photons = 10000;
      this.kdEstimate = 100;
      this.kdRadius = 0.5;
    }

    CausticsExporter.prototype.addToIndex = function(object3d) {
      return null;
    };

    CausticsExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    CausticsExporter.prototype.exportBlock = function() {
      var result;
      result = '';
      if (!this.enabled) {
        return result;
      }
      result += 'photons {\n';
      result += '  caustics ' + this.photons + ' kd ' + this.kdEstimate + ' ' + this.kdRadius + '\n';
      result += '}\n\n';
      return result;
    };

    return CausticsExporter;

  })(BlockExporter);

  Exporter = (function() {
    function Exporter() {
      this.exporterSettings = {
        convertPrimitives: false
      };
      this.blockExporters = [];
      this.image = this.addBlockExporter(new ImageExporter(this));
      this.bucket = this.addBlockExporter(new BucketExporter(this));
      this.traceDepths = this.addBlockExporter(new TraceDepthsExporter(this));
      this.caustics = this.addBlockExporter(new CausticsExporter(this));
      this.gi = this.addBlockExporter(new GiExporter(this));
      this.cameras = this.addBlockExporter(new CameraExporter(this));
      this.lights = this.addBlockExporter(new LightsExporter(this));
      this.materials = this.addBlockExporter(new MaterialsExporter(this));
      this.geometry = this.addBlockExporter(new GeometryExporter(this));
      this.bufferGeometry = this.addBlockExporter(new BufferGeometryExporter(this));
      this.meshes = this.addBlockExporter(new MeshExporter(this));
    }

    Exporter.prototype.addBlockExporter = function(exporter) {
      if (!exporter instanceof BlockExporter) {
        throw new Error('Extend BlockExporter');
      } else {
        this.blockExporters.push(exporter);
      }
      return exporter;
    };

    Exporter.prototype.indexScene = function(object3d) {
      var blockExporter, child, doTraverse, _i, _j, _len, _len1, _ref, _ref1;
      if (object3d.children.length) {
        _ref = object3d.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          doTraverse = true;
          _ref1 = this.blockExporters;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            blockExporter = _ref1[_j];
            blockExporter.addToIndex(child);
            doTraverse = doTraverse && blockExporter.doTraverse(child);
          }
          if (doTraverse) {
            this.indexScene(child);
          }
        }
      }
      return null;
    };

    Exporter.prototype.exportCode = function() {
      var blockExporter, result, _i, _len, _ref;
      result = '';
      _ref = this.blockExporters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        blockExporter = _ref[_i];
        result += blockExporter.exportBlock();
      }
      return result;
    };

    return Exporter;

  })();

  GeometryExporter = (function(_super) {
    __extends(GeometryExporter, _super);

    function GeometryExporter(exporter) {
      GeometryExporter.__super__.constructor.call(this, exporter);
      this.normals = true;
      this.uvs = false;
      this.geometryIndex = {};
    }

    GeometryExporter.prototype.addToIndex = function(object3d) {
      var faceMaterials;
      if (!object3d instanceof THREE.Mesh) {
        return;
      }
      if (object3d instanceof THREE.VertexNormalsHelper) {
        return;
      }
      if (object3d.geometry instanceof THREE.Geometry) {
        if (object3d.geometry instanceof THREEFLOW.InfinitePlaneGeometry) {
          return;
        }
        faceMaterials = object3d.material instanceof THREE.MeshFaceMaterial;
        if (!this.geometryIndex[object3d.geometry.uuid]) {
          this.geometryIndex[object3d.geometry.uuid] = {
            geometry: object3d.geometry,
            faceMaterials: faceMaterials
          };
        } else if (!this.geometryIndex[object3d.geometry.uuid].faceMaterials && faceMaterials) {
          this.geometryIndex[object3d.geometry.uuid].faceMaterials = true;
        }
      }
      return null;
    };

    GeometryExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    GeometryExporter.prototype.exportBlock = function() {
      var entry, face, normal, normals, result, uuid, vertex, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3;
      result = '';
      for (uuid in this.geometryIndex) {
        entry = this.geometryIndex[uuid];
        result += 'object {\n';
        result += '  noinstance\n';
        result += '  type generic-mesh\n';
        result += '  name ' + uuid + '\n';
        result += '  points ' + entry.geometry.vertices.length + '\n';
        _ref = entry.geometry.vertices;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vertex = _ref[_i];
          result += '    ' + this.exportVector(vertex) + '\n';
        }
        result += '  triangles ' + entry.geometry.faces.length + '\n';
        _ref1 = entry.geometry.faces;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          face = _ref1[_j];
          result += '    ' + this.exportFace(face) + '\n';
        }
        if (this.normals) {
          result += '  normals vertex\n';
          normals = [];
          _ref2 = entry.geometry.faces;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            face = _ref2[_k];
            normals[face.a] = face.vertexNormals[0];
            normals[face.b] = face.vertexNormals[1];
            normals[face.c] = face.vertexNormals[2];
          }
          if (normals.length > 0 && normals.length === entry.geometry.vertices.length) {
            for (_l = 0, _len3 = normals.length; _l < _len3; _l++) {
              normal = normals[_l];
              result += '    ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
            }
            result += '\n';
          } else {
            result += '  normals none\n';
          }
        } else {
          result += '  normals none\n';
        }
        if (this.uvs) {
          result += '  uvs none\n';
        } else {
          result += '  uvs none\n';
        }
        if (entry.faceMaterials) {
          result += '  face_shaders\n';
          _ref3 = entry.geometry.faces;
          for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
            face = _ref3[_m];
            result += '    ' + face.materialIndex + '\n';
          }
        }
        result += '}\n\n';
      }
      return result;
    };

    return GeometryExporter;

  })(BlockExporter);

  GiExporter = (function(_super) {
    __extends(GiExporter, _super);

    GiExporter.GLOBAL_MAP_TYPES = ['grid', 'path'];

    GiExporter.TYPES = ['igi', 'irr-cache', 'path', 'ambocc', 'fake'];

    function GiExporter(exporter) {
      GiExporter.__super__.constructor.call(this, exporter);
      this.type = GiExporter.TYPES[0];
      this.enabled = false;
      this.globalMapTypes = GiExporter.GLOBAL_MAP_TYPES;
      this.types = GiExporter.TYPES;
      this.irrCache = {
        samples: 512,
        tolerance: 0.01,
        spacingMin: 0.05,
        spacingMax: 5.0,
        globalEnabled: false,
        globalPhotons: 10000,
        globalMap: GiExporter.GLOBAL_MAP_TYPES[0],
        globalEstimate: 100,
        globalRadius: 0.75
      };
      this.igi = {
        samples: 64,
        sets: 1,
        bias: 0.01,
        biasSamples: 0
      };
      this.path = {
        samples: 32
      };
      this.ambOcc = {
        samples: 32,
        bright: 0xffffff,
        dark: 0x000000,
        maxDistance: 3.0
      };
      this.fake = {
        up: new THREE.Vector3(0, 1, 0),
        sky: 0x000000,
        ground: 0xffffff
      };
    }

    GiExporter.prototype.addToIndex = function(object3d) {
      return null;
    };

    GiExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    GiExporter.prototype.exportBlock = function() {
      var global, result;
      result = '';
      if (!this.enabled) {
        return result;
      }
      result += 'gi {\n';
      result += '  type ' + this.type + '\n';
      if (this.type === 'igi') {
        result += '  samples ' + this.igi.samples + '\n';
        result += '  sets ' + this.igi.sets + '\n';
        result += '  b ' + this.igi.bias + '\n';
        result += '  bias-samples ' + this.igi.biasSamples + '\n';
      } else if (this.type === 'irr-cache') {
        result += '  samples ' + this.irrCache.samples + '\n';
        result += '  tolerance ' + this.irrCache.tolerance + '\n';
        result += '  spacing ' + this.irrCache.spacingMin + ' ' + this.irrCache.spacingMax + '\n';
        if (this.irrCache.globalEnabled) {
          global = '  global ';
          global += this.irrCache.globalPhotons + ' ';
          global += this.irrCache.globalMap + ' ';
          global += this.irrCache.globalEstimate + ' ';
          global += this.irrCache.globalRadius + '\n';
          result += global;
        }
      } else if (this.type === 'path') {
        result += '  samples ' + this.path.samples + '\n';
      } else if (this.type === 'ambocc') {
        result += '  bright { "sRGB nonlinear" 1 1 1 }' + '\n';
        result += '  dark { "sRGB nonlinear" 0 0 0 }' + '\n';
        result += '  samples ' + this.ambOcc.samples + '\n';
        result += '  maxdist ' + this.ambOcc.maxDistance + '\n';
      } else if (this.type === 'fake') {
        result += '  up ' + this.exportVector(this.fake.up + '\n');
        result += '  sky { "sRGB nonlinear" 0 0 0 }' + '\n';
        result += '  ground { "sRGB nonlinear" 1 1 1 }' + '\n';
      }
      result += '}\n\n';
      return result;
    };

    return GiExporter;

  })(BlockExporter);

  ImageExporter = (function(_super) {
    __extends(ImageExporter, _super);

    ImageExporter.FILTERS = ['box', 'triangle', 'gaussian', 'mitchell', 'catmull-rom', 'blackman-harris', 'sinc', 'lanczos', 'ospline'];

    function ImageExporter(exporter) {
      ImageExporter.__super__.constructor.call(this, exporter);
      this.resolutionX = 800;
      this.resolutionY = 600;
      this.antialiasMin = -1;
      this.antialiasMax = 1;
      this.samples = 2;
      this.contrast = 0.1;
      this.filter = ImageExporter.FILTERS[0];
      this.jitter = true;
      this.filterTypes = ImageExporter.FILTERS;
    }

    ImageExporter.prototype.addToIndex = function(object3d) {
      return null;
    };

    ImageExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    ImageExporter.prototype.exportBlock = function() {
      var result;
      result = '';
      result += 'image {\n';
      result += '  resolution ' + this.resolutionX + ' ' + this.resolutionY + '\n';
      result += '  aa ' + this.antialiasMin + ' ' + this.antialiasMax + '\n';
      result += '  samples ' + this.samples + '\n';
      result += '  contrast ' + this.contrast + '\n';
      result += '  filter ' + this.filter + '\n';
      result += '  jitter ' + this.jitter + '\n';
      result += '}\n\n';
      return result;
    };

    return ImageExporter;

  })(BlockExporter);

  LightsExporter = (function(_super) {
    __extends(LightsExporter, _super);

    function LightsExporter(exporter) {
      LightsExporter.__super__.constructor.call(this, exporter);
      this.helperVec = new THREE.Vector3();
      this.lightIndex = {};
    }

    LightsExporter.prototype.addToIndex = function(object3d) {
      var indexed;
      indexed = this.lightIndex[object3d.uuid];
      if (!indexed && object3d instanceof THREEFLOW.SunskyLight) {
        this.lightIndex[object3d.uuid] = object3d;
      } else if (!indexed && object3d instanceof THREEFLOW.PointLight) {
        this.lightIndex[object3d.uuid] = object3d;
      } else if (!indexed && object3d instanceof THREEFLOW.AreaLight) {
        this.lightIndex[object3d.uuid] = object3d;
      }
      return null;
    };

    LightsExporter.prototype.doTraverse = function(object3d) {
      if (object3d instanceof THREEFLOW.PointLight) {
        return false;
      } else if (object3d instanceof THREEFLOW.SunskyLight) {
        return false;
      } else if (object3d instanceof THREEFLOW.AreaLight) {
        return false;
      } else {
        return true;
      }
    };

    LightsExporter.prototype.exportBlock = function() {
      var face, light, result, uuid, vertex, _i, _j, _len, _len1, _ref, _ref1;
      result = '';
      for (uuid in this.lightIndex) {
        light = this.lightIndex[uuid];
        if (light instanceof THREEFLOW.SunskyLight) {
          result += 'light {\n';
          result += '  type sunsky\n';
          result += '  up ' + this.exportVector(light.up) + '\n';
          result += '  east ' + this.exportVector(light.east) + '\n';
          result += '  sundir ' + this.exportVector(light.direction) + '\n';
          result += '  turbidity ' + light.turbidity + '\n';
          result += '  samples ' + light.samples + '\n';
          result += '}\n\n';
        } else if (light instanceof THREEFLOW.PointLight) {
          result += 'light {\n';
          result += '  type point\n';
          result += '  color ' + this.exportColorTHREE(light.color) + '\n';
          result += '  power ' + light.power + ' \n';
          result += '  p ' + this.exportVector(light.position) + '\n';
          result += '}\n\n';
        } else if (light instanceof THREEFLOW.AreaLight) {
          result += 'light {\n';
          result += '  type meshlight\n';
          result += '  name ' + light.uuid + '\n';
          result += '  emit ' + this.exportColorTHREE(light.color) + '\n';
          result += '  radiance ' + light.radiance + ' \n';
          result += '  samples ' + light.samples + ' \n';
          result += '  points ' + light.geometry.vertices.length + '\n';
          _ref = light.geometry.vertices;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            vertex = _ref[_i];
            this.helperVec.copy(vertex);
            this.helperVec.applyMatrix4(light.matrixWorld);
            result += '    ' + this.exportVector(this.helperVec) + '\n';
          }
          result += '  triangles ' + light.geometry.faces.length + '\n';
          _ref1 = light.geometry.faces;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            face = _ref1[_j];
            result += '    ' + this.exportFace(face) + '\n';
          }
          result += '}\n\n';
        }
      }
      return result;
    };

    return LightsExporter;

  })(BlockExporter);

  MaterialsExporter = (function(_super) {
    __extends(MaterialsExporter, _super);

    function MaterialsExporter(exporter) {
      MaterialsExporter.__super__.constructor.call(this, exporter);
      this.materialsIndex = {};
    }

    MaterialsExporter.prototype.addToIndex = function(object3d) {
      var material, _i, _len, _ref;
      if (object3d instanceof THREE.Mesh) {
        if (object3d.material instanceof THREE.MeshFaceMaterial) {
          _ref = object3d.material.materials;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            material = _ref[_i];
            if (!this.materialsIndex[material.uuid]) {
              this.materialsIndex[material.uuid] = material;
            }
          }
        } else if (object3d.material && !this.materialsIndex[object3d.material.uuid]) {
          this.materialsIndex[object3d.material.uuid] = object3d.material;
        }
      }
      return null;
    };

    MaterialsExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    MaterialsExporter.prototype.exportBlock = function() {
      var material, result, uuid;
      result = '';
      for (uuid in this.materialsIndex) {
        material = this.materialsIndex[uuid];
        result += 'shader {\n';
        result += '  name ' + material.uuid + '\n';
        if (material instanceof THREEFLOW.ConstantMaterial || material instanceof THREE.MeshBasicMaterial) {
          result += '  type constant\n';
          result += '  color ' + this.exportColorTHREE(material.color) + '\n';
        } else if (material instanceof THREEFLOW.DiffuseMaterial || material instanceof THREE.MeshLambertMaterial) {
          result += '  type diffuse\n';
          result += '  diff ' + this.exportColorTHREE(material.color) + '\n';
        } else if (material instanceof THREEFLOW.ShinyMaterial) {
          result += '  type shiny\n';
          result += '  diff ' + this.exportColorTHREE(material.color) + '\n';
          result += '  refl ' + material.reflection + '\n';
        } else if (material instanceof THREEFLOW.GlassMaterial) {
          result += '  type glass\n';
          result += '  eta ' + material.eta + '\n';
          result += '  color ' + this.exportColorTHREE(material.color) + '\n';
        } else if (material instanceof THREEFLOW.MirrorMaterial) {
          result += '  type mirror\n';
          result += '  refl ' + this.exportColorTHREE(material.reflection) + '\n';
        } else if (material instanceof THREEFLOW.PhongMaterial || material instanceof THREE.MeshPhongMaterial) {
          result += '  type phong\n';
          result += '  diff ' + this.exportColorTHREE(material.color) + '\n';
          result += '  spec ' + this.exportColorTHREE(material.specular) + ' ' + material.shininess + '\n';
          result += '  samples ' + (material.samples || 4) + '\n';
        }
        result += '}\n\n';
      }
      return result;
    };

    return MaterialsExporter;

  })(BlockExporter);

  MeshExporter = (function(_super) {
    __extends(MeshExporter, _super);

    function MeshExporter(exporter) {
      MeshExporter.__super__.constructor.call(this, exporter);
      this.convertPrimitives = true;
      this.meshIndex = {};
    }

    MeshExporter.prototype.addToIndex = function(object3d) {
      if (!(object3d instanceof THREE.Mesh)) {
        return;
      }
      if (object3d instanceof THREE.VertexNormalsHelper) {
        return;
      }
      if (!this.meshIndex[object3d.uuid]) {
        this.meshIndex[object3d.uuid] = object3d;
      }
      return null;
    };

    MeshExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    MeshExporter.prototype.exportBlock = function() {
      var material, mesh, result, uuid, _i, _len, _ref;
      result = '';
      for (uuid in this.meshIndex) {
        mesh = this.meshIndex[uuid];
        if (mesh.geometry instanceof THREEFLOW.InfinitePlaneGeometry) {
          result += 'object {\n';
          result += '  shader ' + mesh.material.uuid + '\n';
          result += '  type plane\n';
          result += '  p ' + this.exportTransformPosition(mesh) + '\n';
          result += '  n ' + this.exportVector(mesh.up) + '\n';
        } else if (this.convertPrimitives && mesh.geometry instanceof THREE.SphereGeometry) {
          result += 'object {\n';
          result += '  shader ' + mesh.material.uuid + '\n';
          result += '  type sphere\n';
          result += '  name ' + mesh.uuid + '\n';
          result += '  c ' + this.exportTransformPosition(mesh) + '\n';
          result += '  r ' + mesh.geometry.radius + '\n';
        } else if (mesh.material instanceof THREE.MeshFaceMaterial) {
          result += 'instance {\n';
          result += '  name ' + mesh.uuid + '\n';
          result += '  geometry ' + mesh.geometry.uuid + '\n';
          result += '  transform col' + this.exportTransform(mesh) + '\n';
          result += '  shaders ' + mesh.material.materials.length + '\n';
          _ref = mesh.material.materials;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            material = _ref[_i];
            result += '    ' + material.uuid + '\n';
          }
        } else {
          result += 'instance {\n';
          result += '  name ' + mesh.uuid + '\n';
          result += '  geometry ' + mesh.geometry.uuid + '\n';
          result += '  transform col' + this.exportTransform(mesh) + '\n';
          result += '  shader ' + mesh.material.uuid + '\n';
        }
        result += '}\n\n';
      }
      return result;
    };

    return MeshExporter;

  })(BlockExporter);

  TraceDepthsExporter = (function(_super) {
    __extends(TraceDepthsExporter, _super);

    function TraceDepthsExporter(exporter) {
      TraceDepthsExporter.__super__.constructor.call(this, exporter);
      this.enabled = false;
      this.diffusion = 1;
      this.reflection = 4;
      this.refraction = 4;
    }

    TraceDepthsExporter.prototype.addToIndex = function(object3d) {
      return null;
    };

    TraceDepthsExporter.prototype.doTraverse = function(object3d) {
      return true;
    };

    TraceDepthsExporter.prototype.exportBlock = function() {
      var result;
      result = '';
      if (!this.enabled) {
        return result;
      }
      result += 'trace-depths {\n';
      result += '  diff ' + this.diffusion + '\n';
      result += '  refl ' + this.reflection + '\n';
      result += '  refr ' + this.refraction + '\n';
      result += '}\n\n';
      return result;
    };

    return TraceDepthsExporter;

  })(BlockExporter);

  THREEFLOW.InfinitePlaneGeometry = function(width, height, widthSegments, heightSegments) {
    var face, matrix, normal, _i, _len, _ref;
    width = width || 1000;
    height = height || 1000;
    widthSegments = widthSegments || 10;
    heightSegments = heightSegments || 10;
    THREE.PlaneGeometry.call(this, width, height, widthSegments, heightSegments);
    matrix = new THREE.Matrix4();
    matrix.makeRotationX(Math.PI / 2);
    this.applyMatrix(matrix);
    normal = new THREE.Vector3(0, 1, 0);
    _ref = this.faces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      face = _ref[_i];
      face.normal.copy(normal);
      face.vertexNormals[0].copy(normal);
      face.vertexNormals[1].copy(normal);
      face.vertexNormals[2].copy(normal);
    }
    return this.computeCentroids();
  };

  THREEFLOW.InfinitePlaneGeometry.prototype = Object.create(THREE.PlaneGeometry.prototype);

  /*
  
  params :
    # both
    color: 0xffffff
  
    # three.js ( AreaLight )
    intensity: 1
    width: 1
    height: 1
  
    # threeflow / sunflow
    radiance: 100.0
    samples: 16
    geometry: THREE.PlaneGeometry ( or any other geometry object )
    simulate: true
    markers: true
  */


  THREEFLOW.AreaLight = AreaLight = (function() {
    function AreaLight(params) {
      var material;
      if (params == null) {
        params = {};
      }
      THREE.Object3D.call(this);
      if (params.simulate !== false) {
        this.simulate = true;
      }
      if (params.markers !== false) {
        this.markers = true;
      }
      this._color = new THREE.Color(params.color);
      this._radiance = params.radiance || 100.0;
      this.samples = params.samples || 16;
      this.geometry = params.geometry || new THREE.PlaneGeometry(10, 10);
      if (this.markers) {
        material = new THREE.MeshBasicMaterial({
          wireframe: true
        });
        material.color = this._color;
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.add(this.mesh);
      }
      if (this.simulate) {
        this.light = new THREE.PointLight(params.color, params.intensity);
        this.light.color = this._color;
        this.add(this.light);
      }
    }

    AreaLight.prototype = Object.create(THREE.Object3D.prototype);

    Object.defineProperties(AreaLight.prototype, {
      color: {
        get: function() {
          return this._color;
        },
        set: function(value) {
          return this._color = value;
        }
      },
      radiance: {
        get: function() {
          return this._radiance;
        },
        set: function(value) {
          return this._radiance = value;
        }
      }
    });

    return AreaLight;

  })();

  /*
  
  params :
    # both
    color: 0xffffff
  
    # three.js ( PointLight )
    intensity: 1
    distance: 0
  
    # threeflow / sunflow
    power: 100.0
    simulate: true
    markers: true
    markerSize: 1
  */


  THREEFLOW.PointLight = PointLight = (function() {
    function PointLight(params) {
      var geometry, markerSize, material;
      if (params == null) {
        params = {};
      }
      THREE.Object3D.call(this);
      if (params.simulate !== false) {
        this.simulate = true;
      }
      if (params.markers !== false) {
        this.markers = true;
      }
      this._color = new THREE.Color(params.color);
      this._power = params.power || 100.0;
      if (this.markers) {
        markerSize = params.markerSize || 1;
        geometry = new THREE.SphereGeometry(markerSize, 3, 3);
        material = new THREE.MeshBasicMaterial({
          wireframe: true
        });
        material.color = this._color;
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
      }
      if (this.simulate) {
        this.light = new THREE.PointLight(params.color, params.intensity, params.distance);
        this.light.color = this._color;
        this.add(this.light);
      }
    }

    PointLight.prototype = Object.create(THREE.Object3D.prototype);

    Object.defineProperties(PointLight.prototype, {
      color: {
        get: function() {
          return this._color;
        },
        set: function(value) {
          return this._color = value;
        }
      },
      power: {
        get: function() {
          return this._power;
        },
        set: function(value) {
          return this._power = value;
        }
      }
    });

    return PointLight;

  })();

  THREEFLOW.SunskyLight = SunskyLight = (function() {
    function SunskyLight(params) {
      THREE.Object3D.call(this);
      params = params || {};
      this.up = params.up || new THREE.Vector3(0, 1, 0);
      this.east = params.east || new THREE.Vector3(0, 0, 1);
      this.direction = params.direction || new THREE.Vector3(1, 1, 1);
      this.turbidity = params.turbidity || 2;
      this.samples = params.samples || 32;
      if (params.simulate !== false) {
        params.simulate = true;
      }
      if (params.dirLight !== false) {
        params.dirLight = true;
      }
      if (params.hemLight !== false) {
        params.hemLight = true;
      }
      if (params.simulate) {
        if (params.dirLight) {
          this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
          this.add(this.dirLight);
        }
        if (params.hemLight) {
          this.hemLight = new THREE.HemisphereLight(0xffffff, 0x333333, .8);
          this.add(this.hemLight);
        }
      }
    }

    SunskyLight.prototype = Object.create(THREE.Object3D.prototype);

    return SunskyLight;

  })();

  THREEFLOW.ConstantMaterial = ConstantMaterial = (function() {
    function ConstantMaterial(params) {
      if (params == null) {
        params = {};
      }
      THREE.MeshBasicMaterial.call(this);
      this.setValues(params);
    }

    ConstantMaterial.prototype = Object.create(THREE.MeshBasicMaterial.prototype);

    return ConstantMaterial;

  })();

  THREEFLOW.DiffuseMaterial = DiffuseMaterial = (function() {
    function DiffuseMaterial(params) {
      if (params == null) {
        params = {};
      }
      if (params.color === void 0) {
        params.color = 0xffffff;
      }
      THREE.MeshLambertMaterial.call(this);
      this.setValues(params);
    }

    DiffuseMaterial.prototype = Object.create(THREE.MeshLambertMaterial.prototype);

    return DiffuseMaterial;

  })();

  THREEFLOW.GlassMaterial = GlassMaterial = (function() {
    function GlassMaterial(params) {
      if (params == null) {
        params = {};
      }
      if (params.color === void 0) {
        params.color = 0xffffff;
      }
      if (params.eta === void 0) {
        params.eta = 1.0;
      }
      this.eta = params.eta;
      /*
      # No support yet
      @absorptionDistance = params.absorptionDistance || 5.0
      
      if typeof params.absorptionColor is THREE.Color
        @absorptionColor = params.absorptionColor
      else if typeof params.absorptionColor is 'number'
        @absorptionColor = new THREE.Color( params.absorptionColor )
      else
        @absorptionColor = new THREE.Color( 0xffffff )
      */

      THREE.MeshPhongMaterial.call(this);
      this.setValues(params);
    }

    GlassMaterial.prototype = Object.create(THREE.MeshPhongMaterial.prototype);

    return GlassMaterial;

  })();

  THREEFLOW.MirrorMaterial = MirrorMaterial = (function() {
    function MirrorMaterial(params) {
      if (params == null) {
        params = {};
      }
      if (params.reflection === void 0 && params.color === void 0) {
        params.color = 0xffffff;
      } else if (params.reflection === void 0) {
        params.color = params.color;
      } else if (params.color === void 0) {
        params.color = params.reflection;
      } else {
        params.color = 0xffffff;
      }
      THREE.MeshPhongMaterial.call(this);
      this.setValues(params);
      this.reflection = this.color;
    }

    MirrorMaterial.prototype = Object.create(THREE.MeshPhongMaterial.prototype);

    return MirrorMaterial;

  })();

  THREEFLOW.PhongMaterial = PhongMaterial = (function() {
    function PhongMaterial(params) {
      if (params == null) {
        params = {};
      }
      if (params.color === void 0) {
        params.color = 0xffffff;
      }
      if (params.power === void 0) {
        this.power = 100;
      }
      if (params.samples === void 0) {
        this.samples = 4;
      }
      THREE.MeshPhongMaterial.call(this);
      this.setValues(params);
    }

    PhongMaterial.prototype = Object.create(THREE.MeshPhongMaterial.prototype);

    return PhongMaterial;

  })();

  THREEFLOW.ShinyMaterial = ShinyMaterial = (function() {
    function ShinyMaterial(params) {
      if (params == null) {
        params = {};
      }
      if (params.color === void 0) {
        params.color = 0xffffff;
      }
      if (params.reflection === void 0) {
        params.reflection = 0.5;
      }
      this.reflection = params.reflection;
      THREE.MeshPhongMaterial.call(this);
      this.setValues(params);
    }

    ShinyMaterial.prototype = Object.create(THREE.MeshPhongMaterial.prototype);

    return ShinyMaterial;

  })();

}).call(this);
