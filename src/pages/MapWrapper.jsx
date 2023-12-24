import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import $ from "jquery";

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
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Draw from 'ol/interaction/Draw';
import XYZ from 'ol/source/XYZ';
import { MapsContext } from '../context/MapsContext';
import AttQuery from './AttQuery';


// css for openlayers 
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

// chakra ui 
import { Box, Button, VStack, Text} from '@chakra-ui/react';
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
  const [indiSwitch, setIndiSwitch] = useState(false);

  //testing 
  const [drawActive, setDrawActive] = useState(false);

  // this is the function to activate and deactivate drawing tools
  const handleDraw = () => {
    // Change opposite from true to false and so forth 
    setDrawActive(data=>!data);
  }

  // callback function for drawing polygon button
  const handleCall = useCallback((maps, rectangleDraw)=>{
    if(drawActive === true ){
      maps.addInteraction(rectangleDraw);
    }
    else if (drawActive === false) {
      maps.removeInteraction(rectangleDraw);
    }
    else {
      console.log("Error")
    }

  },[drawActive])

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

    // the first vector layer of water areas in Darwin 
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

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {
    const ViewMap = new View({
      projection: 'EPSG:3857',
      center: fromLonLat([-102.93252,42.09808]),
      zoom: 4
    })

    const drawSource = new VectorSource({wrapX:false});
    
    const drawVector = new VectorLayer({
      title: "Drawing",
      source: drawSource,
      transition: 1
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


    // vector layer 
    const usVector = new VectorSource({
      url:()=>{return ('http://localhost:8080/geoserver/topp/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=topp%3Atasmania_state_boundaries&maxFeatures=50&'
      +'outputformat=json');},
      format: new GeoJSON(),
      attributions: '@geoserver',
      strategy: bbox,
    })

    // the first vector layer of water areas in Darwin 
    const firstVector = new VectorLayer({
      title: "Darwin Water Areas",
      source: usVector,
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
      title: "Population Layers",
      layers: [ cityPops, usPops, firstVector, drawVector]
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

    // create an overlay to anchor the popup to the map 
    const popup = new Overlay({
      element: container.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

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
    });  
    // rectangle draw

    // trial for creating button that can activate and deactivate itself 
    
      drawSwitch.current.onclick = function () {
      initialMap.addInteraction(rectangleDraw);
      }
 
      drawOff.current.onclick = function () {
        initialMap.removeInteraction(rectangleDraw);
      }


    // // this is the get feature vector layer section 
    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [ groupBasemap, groupTileLayer
      ],
      view: ViewMap,
      controls: [layerSwitcher, mousePosition, Scala],
      overlays: [popup]
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

    // // customize drawing polygon feature 
    // this is a rectangle shape drawing 
        async function addInteractions(){
          const rectangleDraw = new Draw({
            source: drawSource,
            type: 'Polygon',
          });  
          handleCall(initialMap, rectangleDraw);
      }
  
    // add a click handler to the map to render the popup 
    setMap(initialMap);

    // adding control/layer/filter widgets 
    initialMap.addLayer(queryWFS(urlContext.mapURL));
    addInteractions();
    
    return () => initialMap.setTarget();
  },[urlContext.mapURL, handleCall]);

  const turnOnSwitch = () => {
    setIndiSwitch(true);
  }

  const turnOffSwitch = () => {
    setIndiSwitch(false);
  }
 
  // render component
  return (
    <Box>
      <Box borderRadius="40px" ref={mapElement} className="map-container" z-index="0">
      </Box>
      <VStack position="absolute" spacing="20px" top="150px" z-index="1" ml="20px">
        <AttQuery/>
        <Button colorScheme='blue' p="2px" onClick={handleDraw} > <FaDrawPolygon size="30px" color="white"/></Button>
        <Button colorScheme='green' p='2px' ref={drawSwitch} onClick={turnOnSwitch}>On</Button>
        {/* {indiSwitch === false ?   
        (<Box ref={drawOff} >
        </Box>) 
        :
        (<Button colorScheme='red' p='2px' ref={drawOff} onClick={turnOffSwitch}>
          Off
        </Button>)} */}

        <Button colorScheme='red' p='2px' ref={drawOff} >
          Off
        </Button>
       

        <Box>
          <Text >
            
          </Text>
        </Box>
      </VStack>

      <Box ref={container} className='ol-popup'>
        <a href='#' className='ol-popup-closer' ref={closer}></a>
        <Box ref={content}></Box>
      </Box>
    </Box>
  ) 

}

export default MapWrapper

