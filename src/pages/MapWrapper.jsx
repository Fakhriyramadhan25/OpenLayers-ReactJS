import React, { useState, useEffect, useRef } from 'react';
import $ from "jquery";

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat} from 'ol/proj';
import TileWMS from 'ol/source/TileWMS.js';
import LayerSwitcher from 'ol-layerswitcher';
import Group from 'ol/layer/Group';
import MousePosition from 'ol/control/MousePosition';
import {closestOnCircle, format, toStringHDMS} from 'ol/coordinate';
import ScaleLine from 'ol/control/ScaleLine';
import Overlay  from 'ol/Overlay';
import FullScreen from 'ol/control/FullScreen';
import axios from 'axios';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox} from 'ol/loadingstrategy';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import WFS from 'ol/format/WFS';
import {or, like } from 'ol/format/filter';
import SelectInteraction from 'ol/interaction/Select';
import Fill from 'ol/style/Fill';
import {singleClick} from 'ol/events/condition';



// css for openlayers 
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

// chakra ui 
import { Box, Button, FormControl, FormLabel, Select, VStack, 
  useDisclosure, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, 
  ModalBody, ModalFooter, Modal } from '@chakra-ui/react';
import {TbBrandGoogleMaps} from 'react-icons/tb';
import {MdInfo, MdZoomOutMap} from 'react-icons/md';
import {FaFilterCircleXmark} from 'react-icons/fa6';

const AttQuery = () => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [dataUS, setDataUS] = useState();

  useEffect(()=>{
    axios.get("http://localhost:8080/geoserver/wfs?request=getCapabilities", {
        "Content-Type": "application/xml; charset=utf-8",
      })
    .then((res)=>{
    const dataXML = $(res.data).find('FeatureType Name').text();
    })
    .catch((error)=>{console.log(error)})

  },[])


  return (
    <>
    <Button onClick={onOpen} p="2px" colorScheme='blue'><FaFilterCircleXmark size="30" color='white'/></Button>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader bg="blue.200">
        Attribute Query
        </ModalHeader> 
        <ModalCloseButton/>
        <ModalBody>
          <VStack spacing="20px">
          <FormControl >
              <FormLabel> Select Layer</FormLabel>
              <Select id="selectLayer"></Select>
          </FormControl>
          <FormControl>
              <FormLabel> Select Attribute</FormLabel>
              <Select></Select>
          </FormControl>
          <FormControl>
              <FormLabel> Select Operator</FormLabel>
              <Select></Select>
          </FormControl>
          <FormControl>
              <FormLabel> Select Value</FormLabel>
              <Select></Select>
          </FormControl>
       
          </VStack>
     
        </ModalBody>

        <ModalFooter>
           <Button colorScheme='blue' mr={3} >Run</Button>
           <Button onClick={onClose} colorScheme='gray'>close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>
  );
}


function MapWrapper() {

  // set intial state
  const [map, setMap] = useState();

  // pull refs
  const mapElement = useRef();

  // ref for popup element attributes of the layers 
  const container = useRef();
  const content = useRef();
  const closer = useRef();

  // ref for fullscreen 
  const contFullscreen = useRef();


  // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {
    const ViewMap = new View({
      projection: 'EPSG:3857',
      center: fromLonLat([-102.93252,42.09808]),
      zoom: 4
    })

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

    // Vector layer with filter 
    const AusSource = new VectorSource();

    const AusCountry = new WFS().writeGetFeature({
      srsName: 'EPSG:3857',
      featureNS: '',
      featurePrefix: 'ne',
      featureTypes: ['countries'],
      outputFormat: 'json',
      filter: or(
        like('NAME', 'Australia*'),
        like('NAME', 'China*')
  ),
    });


  fetch('http://localhost:8080/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(AusCountry)
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    var features = new GeoJSON().readFeatures(json);
    console.log(features);
    AusSource.addFeatures(features);
    initialMap.getView().fit(AusSource.getExtent());
}).catch((error)=>{
  console.log(error);
});


    const AusLayer = new VectorLayer({
      title: "2 Countries",
      source: AusSource,
    })

    // compile all the tile layers 
    const groupTileLayer = new Group({
      title: "Population Layers",
      layers: [ cityPops, usPops]
    })

    // this is only for control of the maps 
    // This is the mouse position 
    const mousePosition = new MousePosition({
      projection: 'EPSG:4326',
      coordinateFormat: (coords)=>{return format(coords, 'The point is ({x} | {y})', 3);},
      className: 'mousePosition'
    })

    // layer switcher widget 
    const layerSwitcher = new LayerSwitcher({
      reverse: false,
      groupSelectStyle: 'group',
      activationMode: 'click',
      startActive: false
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

    // fullscreen widget 
    const wFullscreen = new FullScreen({
      target: contFullscreen.current,
      className: "widgetFullScreen"
    });

    // // this is the get feature vector layer section 
    // this is the style for the select variable 
    const selected = new Style({
      fill: new Fill({
        color: '#eeeeee'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.4)',
        width: 2,
      })
    });

    // this is the set for the style and color 
    const selectStyle = () => {
      const color = feature.get('COLOR') || '#eeeeee';
      selected.getFill().setColor(color);
      return selected;
    }


    // get feature info from the vector layer
    const handleSelect = new SelectInteraction({
      condition: singleClick,
      style: selectStyle
    });


    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [new TileLayer({
        source: new OSM(),
      }), groupTileLayer, firstVector
      ],
      view: ViewMap,
      controls: [layerSwitcher, mousePosition, Scala, wFullscreen],
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
      // const coordinate = e.coordinate;
      // const hdms = toStringHDMS(toLonLat(coordinate));

      // content.current.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
      // popup.setPosition(coordinate);
    })
  
    // save map and vector layer references to state
    initialMap.addLayer(AusLayer);
    // add a click handler to the map to render the popup 
    initialMap.addInteraction(handleSelect);

    setMap(initialMap);

    return () => initialMap.setTarget(null);
  },[]);

  
  const lessZoom = (map) => {
    const view = map.getView();
    const currentZoom = view.getZoom()
    const newZoom = currentZoom - 0.5;
    view.setZoom(newZoom);
  };

  const handleHome = (map) => {
    const view = map.getView();
    const newCenter =  fromLonLat([-100.93252,38.09808]);
    view.setCenter(newCenter);

  }


  // render component
  return (
    <Box>
      <Box borderRadius="40px" ref={mapElement} className="map-container" z-index="0">
      </Box>
      <VStack position="absolute" spacing="20px" top="135px" z-index="1" ml="10px">
        <Button p="2px" colorScheme='blue' onClick={()=> lessZoom(map)}><MdInfo size="30px" color='white'/></Button>
        <Button p="2px" colorScheme='blue' onClick={()=>handleHome(map)}><TbBrandGoogleMaps size="30px" color='white'/></Button>
        <Button p="2px" colorScheme='blue' ref={contFullscreen} ><MdZoomOutMap size="30px" color='white'/></Button>
        <AttQuery/>
      </VStack>

      <Box ref={container} className='ol-popup'>
        <a href='#' className='ol-popup-closer' ref={closer}></a>
        <Box ref={content}></Box>
      </Box>

   
      
    </Box>
  ) 

}

export default MapWrapper