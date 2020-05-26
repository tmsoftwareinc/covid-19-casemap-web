import React, { Component } from 'react';
import { GoogleApiWrapper, Map, Marker, InfoWindow } from 'google-maps-react';
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

const API_LATLNG = 'https://covid19.tmsoftwareinc.com/api/v1/latlngs?lat='
const API_ADR = 'https://covid19.tmsoftwareinc.com/api/v1/addresses?country='
const API_GEO = 'https://covid19.tmsoftwareinc.com/api/v1/geos?location='

class GoogleMap extends Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    // HW Upper School
    lat: 34.139619,
    lng: -118.412786,
    city: null,
    county: null,
    state: null,
    country: null,
    date: null,
    cases: null,
    cityJsonData: null,
    countyJsonData: null,
    stateJsonData: null,
    countryJsonData: null,
    cityTabDisabled: false,
    countyTabDisabled: false,
    stateTabDisabled: false,
    countryTabDisabled: false,
    tabIndex: 0,
    searchLocation: 'Harvard-Westlake Upper School',
    usage: 'Usage: Click (Tap) to see data there.'
  }

  getCases() {
    // this.state.lat, lng: this.state.lng
    fetch(API_LATLNG+this.state.lat+'&long='+this.state.lng)
    .then(res => res.json())
    .then((data) => {
      if(data.length === 0) {
        this.setState({
          city: null,
          county: null,
          state: null,
          country: null,
          date: null,
          cases: 'No Data Found Here',
          showingInfoWindow: true,
          activeMarker: {},
          cityJsonData: null,
          countyJsonData: null,
          stateJsonData: null,
          countryJsonData: null,
          tabIndex: 0,
          cityTabDisabled: false,
          countyTabDisabled: false,
          stateTabDisabled: false,
          countryTabDisabled: false,
        });
      }
      else {
        if(data[0]['country'] === 'us' && data[0]['county'] !=='New York City') {
          this.setState({county: data[0]['county']+ ' County'})
        }
        else {
          this.setState({county: data[0]['county']})
        }
  // city existence is assumed at first
      this.setState({
        city: data[0]['city'],
  //      county: data[0]['county'],
        state: data[0]['state'],
        country: data[0]['country'],
        date: data[0]['date'],
        cases: data[0]['cases'] + ' cases',
        showingInfoWindow: true,
        activeMarker: {},
        cityJsonData: data,
        countyJsonData: null,
        stateJsonData: null,
        countryJsonData: null,
        tabIndex: 0,
        cityTabDisabled: false,
        countyTabDisabled: false,
        stateTabDisabled: false,
        countryTabDisabled: false,
      });
 // Move json Data step by step     
      if(data[0]['city'] === '') {
        this.setState({
          tabIndex: 1,
          cityTabDisabled: true,
          cityJsonData: null,
          countyJsonData: data
        });
        if(data[0]['county'] === '') {
          this.setState({
            tabIndex: 2,
            countyTabDisabled: true,
            countyJsonData: null,
            stateJsonData: data
          });
          if(data[0]['state'] === '') {
            this.setState({
              tabIndex: 3,
              stateTabDisabled: true,
              stateJsonData: null,
              countryJsonData: data
            });
          }
          else {
            this.setState({
              countryTabDisabled: true
            });
          }
        } 
        else {
// Get state data
          fetch(API_ADR+data[0]['country']+'&state='+data[0]['state'])
          .then(res3 => res3.json())
          .then((data3) => {
            this.setState({
              countryTabDisabled: true,
              stateJsonData: data3
            });
          });
        }
      }
      else {
        // Get county data
        fetch(API_ADR+data[0]['country']+'&state='+data[0]['state']+'&county='+data[0]['county'])
        .then(res2 => res2.json())
        .then((data2) => {
        this.setState({
          tabIndex: 0,
          countyJsonData: data2
          });
        });

        // Get state data
        fetch(API_ADR+data[0]['country']+'&state='+data[0]['state'])
        .then(res3 => res3.json())
        .then((data3) => {
        console.log(data3)
        this.setState({
          tabIndex: 0,
          countryTabDisabled: true,
          stateJsonData: data3
          });
        });
      }
      }
    })
    .catch(console.log)
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      this.getCases();
    },
    (err) => {
      this.getCases();
      console.log(err);
    })
  }

  mapClicked = (mapProps, map, event) => {
    const { markers } = this.state;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    this.setState({
      lat: lat,
      lng: lng
    });
    this.getCases();
  }

  onMarkerClick = (props, marker, e) => {
    this.setState({
      activeMarker: marker
    });
  }

  onSearchLocationKeyPress = (event) => {
    if(event.keyCode == 13) {
      this.onSearchButtonClick();
    }
  }

  onSearchLocationChange = (event) => {
    this.setState({
      searchLocation: event.target.value 
    });
  }

  onSearchButtonClick = (event) => {
    fetch(API_GEO+this.state.searchLocation)
    .then(res => res.json())
    .then((data) => {
      this.setState({
        lat: data['lat'],
        lng: data['lng'],
        showingInfoWindow: false
      });
    });
  }

  render() {
    return (
      <div>
        <div class="w-section section ">
        <h5>
        Click (Tap) on the map to see total cases there.
        </h5>
        
        <div class="w-container centering">
        <input type='text' size="40" placeholder="City, State, Country" onChange={this.onSearchLocationChange} onKeyDown={this.onSearchLocationKeyPress} />&nbsp;
        <button class="button small-button" onClick={this.onSearchButtonClick}>Search</button>
        </div>
    
      </div>
      <div class="w-section section purple" id="chart">
      <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.setState({ tabIndex })} >
      <TabList>
      <Tab disabledClassName="react-tabs__tab--disabled-hidden" disabled={this.state.cityTabDisabled} >{this.state.city}</Tab>
      <Tab disabledClassName="react-tabs__tab--disabled-hidden" disabled={this.state.countyTabDisabled}>{this.state.county}</Tab>
      <Tab disabledClassName="react-tabs__tab--disabled-hidden" disabled={this.state.stateTabDisabled}>{this.state.state}</Tab>
      <Tab disabledClassName="react-tabs__tab--disabled-hidden" disabled={this.state.countryTabDisabled}>{this.state.country}</Tab>
    </TabList>
      <TabPanel>
      <ResponsiveContainer width="95%" height={200}>
        <LineChart data={this.state.cityJsonData}>
        <XAxis dataKey="date" reversed/>
        <YAxis/>
        <Line type="monotone" dataKey="cases" stroke="#8884d8" />
        <Tooltip />
        </LineChart>
      </ResponsiveContainer>
      </TabPanel>
      <TabPanel>
      <ResponsiveContainer width="95%" height={200}>
        <LineChart data={this.state.countyJsonData}>
        <XAxis dataKey="date" reversed/>
        <YAxis/>
        <Line type="monotone" dataKey="cases" stroke="#8884d8" />
        <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </TabPanel>
    <TabPanel>
      <ResponsiveContainer width="95%" height={200}>
        <LineChart data={this.state.stateJsonData}>
        <XAxis dataKey="date" reversed/>
        <YAxis/>
        <Line type="monotone" dataKey="cases" stroke="#8884d8" />
        <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </TabPanel>
    <TabPanel>
      <ResponsiveContainer width="95%" height={200}>
        <LineChart data={this.state.countryJsonData}>
        <XAxis dataKey="date" reversed/>
        <YAxis/>
        <Line type="monotone" dataKey="cases" stroke="#8884d8" />
        <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </TabPanel>
      </Tabs>
      </div>
      <Map
        google = { this.props.google }
        zoom = { 14 }
        center = {{ lat: this.state.lat, lng: this.state.lng }}
        initialCenter = {{ lat: this.state.lat, lng: this.state.lng }}
        onClick={this.mapClicked}
      >
        <InfoWindow
          visible = { this.state.showingInfoWindow }
          position = {{ lat: this.state.lat, lng: this.state.lng }}
        >
          <div>
            <h4>{this.state.city}:{this.state.county}:{this.state.state}:{this.state.country}<br /> 
        {this.state.date}: {this.state.cases}</h4>
          </div>
        </InfoWindow>
      </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: (process.env.REACT_APP_MAP_API_KEY)
})(GoogleMap);