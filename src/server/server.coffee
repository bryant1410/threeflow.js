express           = require 'express'
io                = require 'socket.io'
http              = require 'http'
path              = require 'path'
fs                = require 'fs'
log               = require './log'
version           = require './version'
render            = require './render'

module.exports =

  create: ()->
     # clear terminal
    log.clear()

    instance = new @Server()
    instance

  Server: class Server

    constructor:()->
      log.notice "[ THREEFLOW " + version.number + " ]"

      @opts     = null
      @app      = null
      @server   = null
      @io       = null

      # connected clients
      @clients  = {} # hash of client it to client object.
      @renderQ  = render.createQueue @

    javaDetect:()->
      return true

    defaults:()->
      opts =
        server:
          port: 3710
          debug: false
          static: "/examples"

        sunflow:
          version: "-version"
          command: "java"
          jar: path.join( __dirname, "../sunflow/sunflow.jar")
          args: [
            "-Xmx1G"
            "-server"
          ]

        flags:
          multipleRenders: false
          allowSave: false
          allowQueue: false
          cancelRendersOnDisconnect: false

        folders:
          renders: "/examples/renders"
          textures: "/examples/textures"
          models: "/examples/models"
          hdr: "/hdr"
          bakes: "/bakes"

      opts

    options:( options={} )->
      @opts = defaults()

      for opt of options.server
        @opts.server[opt] = options[opt]

      for opt of options.flags
        @opts.flags[opt] = options[opt]

      for opt of options.folders
        @opts.folders[opt] = options[opt]

      null

    optionsJSON:(cwd)->
      try
        log.info "Looking for config..."
        jsonPath = path.join(path,"threeflow.json")
        jsonOpts = JSON.parse fs.readFileSync(jsonPath)
        @options jsonOpts
        @setCwd cwd
        log.info "Using " + jsonPath
      catch error
        @setCwd null
        log.warn "No config found.  Use 'threeflow init' to start a project."

      null

    setCwd:(cwd)->
      @cwd = cwd

    startup:()->
      if not @opts
        @opts = @defaults()

      if not @cwd
        log.notice "Starting up without config for now... (Renders won't be saved!)"
        # use node modules folder
        # shouldn't need to set allowSave = false, as this should be the default
        @cwd = path.join(__dirname, "..")
      else
        log.notice "Starting up with config..."

      # TODO: should validate / create folder paths
      # convert to absolute paths
      for folder of @opts.folders
        absFolder = path.join @cwd,@opts.folders[folder]
        @opts.folders[folder] =  absFolder

      @app      = express()
      @server   = http.createServer @app
      @io       = io.listen @server,
        log: @opts.server.debug

      @io.sockets.on 'connection', @onConnection

      @server.listen @opts.server.port
      log.info "Listening on localhost:" + @opts.server.port

      @app.use '/', express.static( path.join(@cwd,@opts.server.static) )

      log.info "Serving " + @opts.folders.serve
      log.notice "Waiting for connection... "

    # when we receive a connection
    onConnection:(socket)=>
      client = new Client(socket,@)
      @clients[ client.id ] = client

      log.info "Client Connected : " + client.id

    # removes a client and cleans up.
    disconnectClient:(client)->
      log.info "Client Disconnected : " + client.id

      @clients[ client.id ] = null
      delete @clients[ client.id ]

      @renderQ.removeAllByClient client
      client.dispose()

  ###
  Client Object.
  ###

  Client: class Client
    constructor:(@socket,@server)->
      @id = @socket.id
      @socket.emit 'connected',
        id: @socket.id

      @socket.on 'render',@onRender
      @socket.on 'disconnect',@onDisconnect

      @renderID = 0


    generateRenderID:()->
      @renderID++
      @id + @renderID

    onRender:(renderData)=>
      log.notice "Received Render..."

      source      = renderData.source
      options     = renderData.options
      sunflow_cl  = renderData.sunflow_cl

      ren = render.createRender @,source,options,sunflow_cl
      @server.renderQ.add ren

      @socket.emit 'render-added',
        id: ren.id
        status: ren.status
        message: ren.message

      @server.renderQ.process()

      null

    onDisconnect:()=>
      # remove self.
      @server.disconnectClient @

    dispose:()->
      @socket = null
      null