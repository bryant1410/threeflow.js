

#= class InfinitePlaneGeometry extends THREE.PlaneGeometry
THREE.SF.InfinitePlaneGeometry = (width, height, widthSegments, heightSegments)->

    width  = width || 10000
    height = height || 10000
    widthSegments = widthSegments || 100
    heightSegments = heightSegments || 100

    #super(width,height,widthSegments,heightSegments)

    console.log width,height,widthSegments,heightSegments
    THREE.PlaneGeometry.call @


THREE.SF.InfinitePlaneGeometry.prototype = Object.create( THREE.PlaneGeometry.prototype )
