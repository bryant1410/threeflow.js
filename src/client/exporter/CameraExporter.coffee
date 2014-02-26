
class CameraExporter extends BlockExporter

  constructor:(exporter)->
    super(exporter)

    @helperVec  = new THREE.Vector3()
    @camera     = null

  addToIndex:(object3d)->
    # camera set manually by exporter ( via render( scene, camera ) )
    null

  doTraverse:(object3d)->
    true

  exportBlock:()->
    result = ''
    result += 'camera {\n'
    result += '  type pinhole\n'

    @helperVec.copy @camera.position
    @helperVec.applyMatrix4 @camera.matrixWorld

    result += '  eye ' + @exportVector(@camera.position) + '\n'

    @helperVec.set 0,0,-1
    @helperVec.applyMatrix4 @camera.matrixWorld

    result += '  target ' + @exportVector(@helperVec) + '\n'
    result += '  up ' + @exportVector(@camera.up) + '\n'

    # TODO: multiplying the fov by the aspect ratio seems to correct
    # the sunflow renderer problems.
    # but not perfect.
    result += '  fov ' + @camera.fov*@camera.aspect + '\n'
    result += '  aspect ' + @camera.aspect + '\n'
    result += '}\n\n'

    return result