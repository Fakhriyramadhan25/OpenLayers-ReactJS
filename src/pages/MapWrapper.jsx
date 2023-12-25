import React, { useState, useEffect, useRef, useContext} from 'react';
import $ from "jquery";
import { MapsContext } from '../context/MapsContext';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM';
import { fromLonLat} from 'ol/proj';
import TileWMS from 'ol/source/TileWMS.js';
import LayerSwitcher from 'ol-layerswitcher';
import Group from 'ol/layer/Group';
import MousePosition from 'ol/control/MousePosition';
import {format} from 'ol/coordinate';
import ScaleLine from 'ol/control/ScaleLine';
import Overlay  from 'ol/Overlay';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox} from 'ol/loadingstrategy';
import {Fill, Stroke, Style, RegularShape, Text} from 'ol/style';
import Draw from 'ol/interaction/Draw';
import XYZ from 'ol/source/XYZ';
import AttQuery from './AttQuery';
import { getArea  } from 'ol/sphere';
import {LineString} from 'ol/geom.js';
import Navbar from '../components/Navbar';


// css for openlayers 
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

// chakra ui 
import { Box, Button, VStack} from '@chakra-ui/react';
import { FaDrawPolygon } from "react-icons/fa";


function MapWrapper() {
  // set intial state
  const [map, setMap] = useState();

  // pull refs
  const mapElement = useRef();

  // ref for popup element attributes of the layers 
  const container = useRef();
  const content = useRef();
  const closer = useRef();


  // draw switching button 
  const drawSwitch = useRef();
  const drawOff = useRef("");
  const [indiSwitch, setIndiSwitch] = useState('hidden');


  // this is the variable for using the map context
  const urlContext = useContext(MapsContext);

  // function to add new wfs from the query attribute
  const queryWFS = (urlWFS) => {
    const querySource = new VectorSource({
      url:()=>{return (urlWFS);},
      format: new GeoJSON(),
      attributions: '@geoserver',
      strategy: bbox,
    })

    // This is for the query 
    const queryVector = new VectorLayer({
      title: "Filtered Layers",
      source: querySource,
      style: new Style({
        fill: new Fill({
          color: '#8f2929'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 1.0)',
          width: 2,
        }),
      }),
    })
    return queryVector;
  }


  // view maps 
  const ViewMap = new View({
    projection: 'EPSG:3857',
    center: fromLonLat([-102.93252,42.09808]),
    zoom: 4
  })

  const drawSource = new VectorSource({wrapX:false});
  
  const drawVector = new VectorLayer({
    title: "Drawing",
    source: drawSource,
    transition: 1,
    style: function(feature) {
      return styleFunction(feature);
    }
  });

  const usPops = new TileLayer({
    title:"Distribution of USA Population",
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/topp/wms',
      params: {'LAYERS': 'topp:states', 'TILED': true},
      serverType: 'geoserver'
    }),
      visible: true
  })

  const cityPops = new TileLayer({
    title:"The most populated cities",
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/ne/wms',
      params: {'LAYERS': 'ne:populated_places', 'TILED': true},
      serverType: 'geoserver',
    }),
    visible: false,
    transition: 1
  })

  // this is a basemap for OSM
  const OSMBase = new TileLayer({
    title: 'OSM',
    type: 'base',
    visible: true,
    source: new OSM(),
  })

  // this is a basemap for earth satelite 
  const earthBase = new TileLayer({
    title: 'Satellite',
    type: 'base',
    visible: false,
    source: new XYZ({
      attributions: ['Powered by Esri',
      'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
      ],
      attributionsCollapsible: false,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 23
    })
  })

  // basemap group 
  const groupBasemap = new Group({
    title: 'Basemap Option',
    layers: [OSMBase, earthBase]
  })

  // compile all the tile layers 
  const groupTileLayer = new Group({
    title: "Main Layers",
    layers: [ cityPops, usPops, drawVector]
  })

  ////// this is only for control of the maps 
  // This is the mouse position 
  const mousePosition = new MousePosition({
    projection: 'EPSG:4326',
    coordinateFormat: (coords)=>{return format(coords, 'The point is ({x} | {y})', 3);},
    className: 'mousePosition'
  })

  // layer switcher widget 
  const layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group',
    activationMode: 'click',
    startActive: false,
    tipLabel: 'Legend',
  })

  // for scalebar widget
  const Scala = new ScaleLine({
    bar: true,
    text: true
  })

  // rectangle draw

  // equation for calculating the area 
  let calcArea = (polygon) => {
    const area = getArea(polygon);
    let output; 
    if (area > 100){
      output = Math.round((area/1000) *100)/100 + ' km';
    }
    else {
      output = Math.round(area*100) / 100 + ' m';
    }
    return output
  }

  // this is the style for the drawing area 
  const style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2,
    }),
  });

  // this is the style for the label 
  const labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15,
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
    }),
  });

  const tipStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });
  
    let tipPoint;
    // area label for the drawing part 
    function styleFunction(feature, drawType, tip) {
      const styles = [];
      const geometry = feature.getGeometry();
      const type = geometry.getType();
      let point, label, line;
      if (!drawType || drawType === type || drawType === 'Point' ) {
        styles.push(style);
        if (type === 'Polygon') {
          point = geometry.getInteriorPoint();
          label = calcArea(geometry);
          line = new LineString(geometry.getCoordinates()[0]);
        } 
      }
      if (label) {
        labelStyle.setGeometry(point);
        labelStyle.getText().setText(label);
        styles.push(labelStyle);
      }
      if (
        tip &&
        type === 'Point'
      ) {
        tipPoint = geometry;
        tipStyle.getText().setText(tip);
        styles.push(tipStyle);
      }
      return styles;
    }


  // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {

    // add a click handler to hide the popup return boolean 
    closer.current.onclick = function () {
      popup.setPosition(undefined);
      closer.current.blur();
      return false;
    };


      // rectangle draw 
      const rectangleDraw = new Draw({
        source: drawSource,
        type: 'Polygon',
        style: function(feature) {
          return styleFunction(feature, 'Polygon', 'Start')
        }
      });  
  
      
      // trial for creating button that can activate and deactivate itself 
        drawSwitch.current.onclick = function () {
        initialMap.addInteraction(rectangleDraw);
        }
    
        drawOff.current.onclick = function () {
          initialMap.removeInteraction(rectangleDraw);
          drawSource.clear()
        }

      
       // create an overlay to anchor the popup to the map 
        const popup = new Overlay({
          element: container.current,
          autoPan: {
            animation: {
              duration: 250,
            },
          },
        });
      
    // // this is the get feature vector layer section 
    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [ groupBasemap, groupTileLayer],
      view: ViewMap,
      controls: [layerSwitcher, mousePosition, Scala],
    });

    // add a click handler to the map to render the popup
    initialMap.on('singleclick', (e)=>{
      content.current.innerHTML = '';
      let resolution = ViewMap.getResolution();

      let url = usPops.getSource().getFeatureInfoUrl(e.coordinate, resolution, 'EPSG:3857',{
        'INFO_FORMAT': 'application/json',
        'propertyName': 'STATE_NAME,PERSONS'
      });

      if(url){
        $.getJSON(url, (data)=>{
          let feature = data.features[0];
          let props = feature.properties;
          content.current.innerHTML = "<h3><strong> State: </strong></h3> <p>"+ props.STATE_NAME.toUpperCase() + "</p>"+
          "<h3> Population: </h3> <p>"+ props.PERSONS + " Persons</p>";

          popup.setPosition(e.coordinate);
        })
      }
      else{
        popup.setPosition(undefined);
      }
    })

  
    // add a click handler to the map to render the popup 
    setMap(initialMap);

    // adding control/layer/filter widgets 
    
    initialMap.addLayer(queryWFS(urlContext.mapURL));
    initialMap.addOverlay(popup);

    
    return () => initialMap.setTarget();
  },[urlContext.mapURL]);

    

  const turnOnSwitch = () => {
    setIndiSwitch('visible');
  }

  const turnOffSwitch = () => {
    setIndiSwitch('hidden');
  }
 
  // render component
  return (
    <> 
    <Navbar/>
    <Box>
      <Box borderRadius="40px" ref={mapElement} className="map-container" z-index="0">
      </Box>
      <VStack position="absolute" spacing="20px" top="150px" z-index="1" ml="20px">
        <AttQuery/>
        <Button colorScheme='blue' p="2px" ref={drawSwitch} onClick={turnOnSwitch}> <FaDrawPolygon size="30px" color="white"/></Button>

        <Box style={{visibility: indiSwitch}} onClick={turnOffSwitch}>
        <Button colorScheme='red' p='2px' ref={drawOff} >
          Off
        </Button>
        </Box>
      </VStack>

      <Box ref={container} className='ol-popup'>
        <a href='#' className='ol-popup-closer' ref={closer}></a>
        <Box ref={content}></Box>
      </Box>
    </Box>
    </>
  ) 

}

export default MapWrapper

