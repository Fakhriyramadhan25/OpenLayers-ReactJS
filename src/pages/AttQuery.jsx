import React, { useState, useEffect, useRef, useReducer, useContext } from 'react';
import $ from "jquery";

// openlayers
import axios from 'axios';
import { MapsContext } from '../context/MapsContext';


// css for openlayers 
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

// chakra ui 
import { Button, FormControl, FormLabel, Select, VStack, 
  useDisclosure, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, 
  ModalBody, ModalFooter, Modal, Text, Input } from '@chakra-ui/react';
import {FaFilterCircleXmark} from 'react-icons/fa6';


function AttQuery() {
  // // Variable for the query attribute widget 
  const {isOpen, onOpen, onClose} = useDisclosure();
  const OperatorOption = [
    { label: "Greater than", value: ">"},
    { label: "Less than", value: "<"},
    { label: "Equal to", value: "="},
    { label: "Between", value: "BETWEEN"},
    { label: "Like", value: "ILIKE"},
  ]
  const checkDif = useRef(false);
  const [fetchLayer, setFetchLayer] = useState([]);
  const [fetchAtt, setFetchAtt ] = useState();

  // using context api from MAPCONTEXT  
  const context = useContext(MapsContext);

  // // this is form reducer 
  const initialForm = {
    dataLayer: "",
    dataAtt: "",
    dataOperator: "",
    dataValue: "",
}

  const optionReducer = (state,action) => {
    switch(action.type){
      case "INPUT":
       return {
        ...state, [action.field] : action.payload
      }
      case "RESET":
        return initialForm
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(optionReducer, initialForm);

  const addOperator = (e) => {
    dispatch({
      type: "INPUT",
      field: e.target.name,
      payload: e.target.value
    })
  }

  const resetOperator = () => {
    dispatch({
      type: "RESET"
    })
  }

  // // create useeffect for fetching the data
  useEffect(()=>{
    // fetching for drop down layer 
     $.ajax({
       type: "GET",
       url: "http://localhost:8080/geoserver/wfs?request=getCapabilities",
       dataType: "xml",
       success: function(xml) {
           $(xml).find('FeatureType').each(function() {
               $(this).find('Name').each(function() {
                   var value = $(this).text();
                   setFetchLayer(data=>[...data, value]);
               });
           });
     }})
 },[checkDif])

 useEffect(()=>{
    
    const catchAttribute = async () => {
        await axios.get(
         'http://localhost:8080/geoserver/wfs?service=WFS&version=1.0.0'
         +'&request=GetFeature&typeNames='
         + state.dataLayer
         + '&outputformat=json'
       )
       .then(res=>{
         setFetchAtt(Object.keys(res.data.features[0].properties))
       })
       .catch(error=>console.log(error))
      }
  
      if (state.dataLayer && state.dataLayer != null) {
        catchAttribute()
        .catch(err=>console.log(err));
    }
 
 },[state.dataLayer])

    const runQuery = async () => {
      let urlLayer = "http://localhost:8080/geoserver/wfs?service=WFS&version=1.0.0"+
      "&request=GetFeature&typeName=" 
      + state.dataLayer + "&CQL_FILTER=" 
      + state.dataAtt 
      + "+" + state.dataOperator
      + "+" + state.dataValue
      + "&outputFormat=application/json";

      context.tryDispatch({
        type: "UPDATE",
        payload: urlLayer
      })

      resetOperator();
    }



  return (
    <>
    <Button onClick={onOpen} p="2px" colorScheme='blue'><FaFilterCircleXmark size="30" color='white'/></Button>
    <Modal isOpen={isOpen} onClose={onClose} >
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader bg="blue.200">
        Attribute Query
        </ModalHeader> 
        <ModalCloseButton/>
        <ModalBody>
          <VStack spacing="20px">
          <form>
          <FormControl >
              <FormLabel> Select Layer</FormLabel>
              <Select name="dataLayer" value={state.dataLayer} onChange={(e)=>addOperator(e)}>
                {fetchLayer && fetchLayer.map((data, index)=>
                {return (
                  <option key={index}>{data}</option>
                )}
                )}
              </Select>
          </FormControl>
          <FormControl>
              <FormLabel> Select Attribute</FormLabel>
              <Select name="dataAtt" value={state.dataAtt} onChange={(e)=>addOperator(e)}>
              {fetchAtt && fetchAtt.map((data, index)=>{
                return (
                  <option key={index} value={data}>{data}</option>
                )
              })}
              </Select>
          </FormControl>
          <FormControl>
              <FormLabel> Select Operator</FormLabel>
              <Select name="dataOperator" value={state.dataOperator} onChange={(e)=>addOperator(e)}>
                {OperatorOption.map((data)=>{
                  return (
                    <option key={data.label} value={data.value}>{data.label}</option>
                  )
                })}
              </Select>
          </FormControl>
          <FormControl>
              <FormLabel> Select Value</FormLabel>
              <Input name="dataValue" value={state.dataValue} onChange={(e)=>addOperator(e)} />

          </FormControl>
          </form>
          </VStack>
     
        </ModalBody>

        <ModalFooter>
           <Button colorScheme='blue' mr={3} onClick={runQuery}>Run</Button>
           <Button onClick={onClose} colorScheme='gray'>close</Button>
           
           <Text></Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>
  );
}

export default AttQuery