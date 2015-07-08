
var Roof = require('roof')

require('../../util/namespace')( Roof, 'addon.react.container')

var React = require('react')
var Mixin = require('./mixin/react.js')

Roof.token = Date.now()

function SourceReadyMixin(source) {
  var forceUpdate

  return {
    componentDidMount: function () {
      forceUpdate = this.forceUpdate.bind(this)
      source.on('ready', forceUpdate)
      source.on('error', forceUpdate)
    },
    componentWillUnmount: function () {
      source.removeListener('ready', forceUpdate)
      source.removeListener('error', forceUpdate)
    }
  }
}

Roof.createContainer = function (def) {
  //TODO 订阅数据
  var source = Roof.Data.subscribe(def.cursors)

  //这个时候source里的数据不一定都准备好了
  var cursorMixin = new Mixin(source, {cursors: def.cursors, source:true})
  var sourceReadyMixin = new SourceReadyMixin(source)
  def.mixins = [cursorMixin, sourceReadyMixin].concat(def.mixins || [])

  var _render = def.render
  //TODO 重写render
  if (def.safeRender) {
    def.render = def.safeRender
  } else {
    def.render = function () {

      if (!source._isReady) {
        return source._error !== null ?
          (def.errorRender ?  def.errorRender.call(this) : 'error occurred when loading data')
          : null
      }else{
        return _render.call(this)
      }
    }
  }

  return React.createClass(def)
}




