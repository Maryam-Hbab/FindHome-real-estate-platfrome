declare module "leaflet-draw" {
    namespace L {
      namespace Draw {
        namespace Event {
          const CREATED: string
          const EDITED: string
          const DELETED: string
          const DRAWSTART: string
          const DRAWSTOP: string
          const DRAWVERTEX: string
          const EDITSTART: string
          const EDITMOVE: string
          const EDITRESIZE: string
          const EDITVERTEX: string
          const EDITSTOP: string
          const DELETESTART: string
          const DELETESTOP: string
        }
  
        class Event {
          static CREATED: string
          static EDITED: string
          static DELETED: string
          static DRAWSTART: string
          static DRAWSTOP: string
          static DRAWVERTEX: string
          static EDITSTART: string
          static EDITMOVE: string
          static EDITRESIZE: string
          static EDITVERTEX: string
          static EDITSTOP: string
          static DELETESTART: string
          static DELETESTOP: string
        }
      }
  
      namespace Control {
        interface DrawConstructorOptions {
          position?: string
          draw?: {
            polyline?: boolean | any
            polygon?: boolean | any
            rectangle?: boolean | any
            circle?: boolean | any
            marker?: boolean | any
            circlemarker?: boolean | any
          }
          edit?: {
            featureGroup: L.FeatureGroup
            remove?: boolean
            edit?: boolean
          }
        }
  
        class Draw extends L.Control {
          constructor(options?: DrawConstructorOptions)
        }
      }
  
      interface DrawOptions {
        polyline?: boolean | any
        polygon?: boolean | any
        rectangle?: boolean | any
        circle?: boolean | any
        marker?: boolean | any
        circlemarker?: boolean | any
      }
  
      interface EditOptions {
        featureGroup: L.FeatureGroup
        remove?: boolean
        edit?: boolean
      }
  
      interface DrawEvents {
        created: LayerEvent
        edited: EditEvent
        deleted: EditEvent
        drawstart: DrawEvent
        drawstop: DrawEvent
        drawvertex: LayerEvent
        editstart: DrawEvent
        editmove: LayerEvent
        editresize: LayerEvent
        editvertex: LayerEvent
        editstop: DrawEvent
        deletestart: DrawEvent
        deletestop: DrawEvent
      }
  
      interface LayerEvent {
        layer: L.Layer
        layerType: string
      }
  
      interface EditEvent {
        layers: L.LayerGroup
      }
  
      interface DrawEvent {
        target: L.Draw.Feature
      }
    }
  }
  