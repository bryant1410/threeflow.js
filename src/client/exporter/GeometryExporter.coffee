
class GeometryExporter extends BlockExporter

  constructor:(exporter)->
    super(exporter)

    @normals = true

    @vertexNormals = false # otherwise facevarying

    @uvs = true

    # create a cache for some .sc code that comes from larger models.
    # rather than generate this everytime we hit render.
    @geometrySourceCache = {}

    @geometryIndex = null

  clean:()->
    @geometryIndex = {}
    null

  addToIndex:(object3d)->

    if not object3d instanceof THREE.Mesh
      return

    if object3d.geometry instanceof THREE.Geometry

      # TODO : Skip Primitives Geometry when converting to sunflow primitives.

      # Exclude any custom geometry - these will be exported via the MeshExporter
      if object3d.geometry instanceof THREEFLOW.InfinitePlaneGeometry
        return

      # check if this mesh has a MeshFaceMaterial to define face materialIndexes
      faceMaterials = object3d.material instanceof THREE.MeshFaceMaterial

      if not @geometryIndex[object3d.geometry.uuid]
        @geometryIndex[object3d.geometry.uuid] =
          geometry: object3d.geometry
          faceMaterials:  faceMaterials

      else if not @geometryIndex[object3d.geometry.uuid].faceMaterials and faceMaterials
        # if we already have this geometry but no face material we may have more than one instance of this
        # geometry with face materials defined. We would then need to store face materialIndexes.

        # *Note* Not sure if we should define this as another geometry/generic-mesh instance
        # or sunflow will allow us to create an instance without satisfying all shaders.
        @geometryIndex[object3d.geometry.uuid].faceMaterials = true

    null

  doTraverse:(object3d)->
    true

  exportBlock:()->
    result = ''
        
    for uuid of @geometryIndex
      entry = @geometryIndex[uuid]

      # pull from cache, if we have it.
      if not entry.geometry._tf_noCache and @exporter.useGeometrySourceCache and @geometrySourceCache[uuid]
        result = @geometrySourceCache[uuid]
        continue


      result += 'object {\n'
      result += '  noinstance\n'
      result += '  type generic-mesh\n'
      result += '  name ' + uuid + '\n'
      result += '  points ' + entry.geometry.vertices.length + '\n'

      for vertex in entry.geometry.vertices
        result += '    ' + @exportVector(vertex) + '\n'

      result += '  triangles ' + entry.geometry.faces.length + '\n'

      for face in entry.geometry.faces
        result += '    ' + @exportFace(face) + '\n'

      if @normals and @vertexNormals
        normals = []

        for face in entry.geometry.faces
          normals[ face.a ] = face.vertexNormals[0]
          normals[ face.b ] = face.vertexNormals[1]
          normals[ face.c ] = face.vertexNormals[2]

        if normals.length > 0 and normals.length is entry.geometry.vertices.length
          result += '  normals vertex\n'

          for normal in normals
            result += '    ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n'

          result += '\n'
        else
          THREEFLOW.warn "Problem with geometry normals.",object3d
          result += '  normals none\n'
      else if @normals and not @vertexNormals
        result += '  normals facevarying\n'

        for face in entry.geometry.faces
          v1 = face.vertexNormals[0]
          v2 = face.vertexNormals[1]
          v3 = face.vertexNormals[2]

          result += '    ' + v1.x + ' ' + v1.y + ' ' + v1.z + ' ' + v2.x + ' ' + v2.y + ' ' + v2.z + ' ' + v3.x + ' ' + v3.y + ' ' + v3.z + '\n'

      else
        result += '  normals none\n'

      if @uvs
        uvs = entry.geometry.faceVertexUvs[0]
        if uvs.length is entry.geometry.faces.length
          result += '  uvs facevarying\n'
          for uv in uvs
            result += '    ' + uv[0].x + ' ' + uv[0].y + ' ' + uv[1].x + ' ' + uv[1].y + ' ' + uv[2].x + ' ' + uv[2].y + '\n'
        else
          THREEFLOW.warn "UV count didn't match face count.",entry.geometry
          result += '  uvs none\n'
      else
        result += '  uvs none\n'

      if entry.faceMaterials
        result += '  face_shaders\n'
        for face in entry.geometry.faces
          result += '    ' + face.materialIndex + '\n'

      result += '}\n\n'

      if not entry.geometry._tf_noCache and @exporter.useGeometrySourceCache
        @geometrySourceCache[ uuid ] = result

    return result