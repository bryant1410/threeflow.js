
window.THREEFLOW = window.THREEFLOW || {}

THREEFLOW.DatGui = class DatGUI

  constructor:(@renderer)->
    if not window.dat and not window.dat.GUI
      throw new Error "No dat.GUI found."

    dat.GUI.prototype.removeFolder =(name)->
      console.log "REMOVE", @, name
      @__folders[name].close()
      @__ul.removeChild this.__folders[name].li
      dom.removeClass this.__folders[name].li,'folder'
      @__folders[name] = undefined
      @onResize()

    @gui = new dat.GUI()
    #@gui.remember @renderer.image
    #@gui.remember @renderer.traceDepths
    #@gui.remember @renderer.caustics

    # user can add custom handlers by setting these properties.
    @onRender = null
    #@onPreview = null

    # add render and preview buttons.
    @gui.add(@,"_onRender").name("Render")
    #@gui.add(@,"_onPreview").name("Render Preview")
    @gui.add @renderer,"scale"

    @imageFolder        = @gui.addFolder "Image"
    @bucketFolder       = @gui.addFolder "Bucket Size/Order"
    @traceDepthsFolder  = @gui.addFolder "Trace Depths"
    @causticsFolder     = @gui.addFolder "Caustics"
    @giFolder           = @gui.addFolder "Global Illumination"
    @otherFolder        = @gui.addFolder "Other Options"

    @imageFolder.add @renderer.image,"antialiasMin"
    @imageFolder.add @renderer.image,"antialiasMax"
    @imageFolder.add @renderer.image,"samples"
    @imageFolder.add @renderer.image,"contrast"
    @imageFolder.add @renderer.image,"filter",@renderer.image.filterTypes
    @imageFolder.add @renderer.image,"jitter"

    @bucketFolder.add @renderer.bucket,"enabled"
    @bucketFolder.add @renderer.bucket,"size"
    @bucketFolder.add @renderer.bucket,"order",@renderer.bucket.orderTypes
    @bucketFolder.add @renderer.bucket,"reverse"

    @traceDepthsFolder.add @renderer.traceDepths,"enabled"
    @traceDepthsFolder.add @renderer.traceDepths,"diffusion"
    @traceDepthsFolder.add @renderer.traceDepths,"reflection"
    @traceDepthsFolder.add @renderer.traceDepths,"refraction"

    @causticsFolder.add @renderer.caustics,"enabled"
    @causticsFolder.add @renderer.caustics,"photons"
    @causticsFolder.add @renderer.caustics,"kdEstimate"
    @causticsFolder.add @renderer.caustics,"kdRadius"

    @otherFolder.add @renderer.meshes,"convertPrimitives"
    @otherFolder.add(@renderer.geometry,"normals").name("geomNormals")
    @otherFolder.add(@renderer.bufferGeometry,"normals").name("bufferGeomNormals")

    @giFolder.add @renderer.gi,"enabled"

    # change the sub folder when the type changes.
    @giFolder.add(@renderer.gi,"type",@renderer.gi.types).onChange (value)=>
      updateType value

    @giTypes = [
      {type:@renderer.gi.types[0], name:"Instant GI", property:"igi"}
      {type:@renderer.gi.types[1], name:"Irradiance Caching / Final Gathering", property:"irrCache"}
      {type:@renderer.gi.types[2], name:"Path Tracing", property:"path"}
      {type:@renderer.gi.types[3], name:"Ambient Occlusion", property:"ambOcc"}
      {type:@renderer.gi.types[4], name:"Fake Ambient Term", property:"fake"}
    ]

    @giSubFolder = null

    updateFolder =(type)=>
      if not @giSubFolder
        @giSubFolder = @giFolder.addFolder(type.name)
      else
        controllers = @giSubFolder.__controllers.slice(0)
        for controller in controllers
          @giSubFolder.remove controller
        # hack here - this version of dat gui slices the array.. ( rather than splice )
        @giSubFolder.__controllers.splice(0)
        @giSubFolder.__ul.firstChild.innerHTML = type.name

      for property of @renderer.gi[type.property]
        if type.type is "irr-cache" and property is "globalMap"
          @giSubFolder.add @renderer.gi.irrCache,"globalMap",@renderer.gi.globalMapTypes
        else if type.type is "ambocc" and ( property is "bright" or property is "dark" )
          @giSubFolder.addColor @renderer.gi[type.property],property
        else if type.type is "fake"

          # TODO Fake Ambient - THREE.Vector3 Controller for Dat.GUI??
          console.log "SKIPPED FAKE AMBIENT TERM GI(TODO)"

        else
          @giSubFolder.add @renderer.gi[type.property],property

      null

    updateType = (type)=>
      @renderer.gi.type = type
      updateFolder @giTypes[@renderer.gi.types.indexOf(type)]
      null

    updateType @renderer.gi.type

    null

  _onRender:()=>
    if @onRender
      @onRender()

  ###
  _onPreview:()=>
    if @onPreview
      @onPreview()

  ###






