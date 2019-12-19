import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

import {
  Dimensions,
  TouchableHighlight,
  Text,
  Alert,
  SafeAreaView,
  View,
  Linking
} from 'react-native';

export default class App extends Component {
  constructor(props) {
    super(props);
    // this.state = { visible: false };
  }

  // onPress = () => {
  //   this.setState({
  //     visible: !this.state.visible,
  //   });

  // };

  onMessage(event) {
    console.log('event ----', event);
    Alert.alert('handle message')
    let msgData;
    try {
      msgData = JSON.parse(event.nativeEvent.data);
      console.log('WebViewLeaf : received message: ', msgData)
    } catch (err) {
      console.log('error', err);
    }
  }

  _onNavigationStateChange(event) {
    console.log('navigation ----', event.url);
  }

  parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
      queryEnd = url.indexOf("#") + 1 || url.length + 1,
      query = url.slice(queryStart, queryEnd - 1),
      pairs = query.replace(/\+/g, " ").split("&"),
      parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
      nv = pairs[i].split("=", 2);
      n = decodeURIComponent(nv[0]);
      v = decodeURIComponent(nv[1]);

      if (!parms.hasOwnProperty(n)) parms[n] = [];
      parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
  }

  render() {
    const screenWidth = Math.round(Dimensions.get('window').width);
    // console.log('visible', this.state.visible);
    return (
      <View style={{ flex: 1 }}>
        <WebView
          style={{ width: '100%', height: '100%' }}
          source={{ uri: 'http://portal-pet.vodafone.ro/api-gateway/login?seamless=true' }}
          ref={webView => (this.webView = webView)}
          onMessage={this.onMessage}
          onNavigationStateChange={this._onNavigationStateChange.bind(this)}
          useWebKit={false}
          onShouldStartLoadWithRequest={request => {
            if (request.url.startsWith('https://portal-pet.vodafone.ro/api-gateway/login?code=')) {
              console.log('req url', request.url);
              // Linking.openURL(request.url).catch((err) => console.error('An error occurred', err));
              RNFetchBlob.config({
                trusty: true
              })
                .fetch('GET', request.url)
                .then((res) => {
                  let status = res.info().status;
                  console.log('status ---', status);
                  if (status === 200 || status === 302) {
                    console.log('Location ---', res.respInfo.headers.Location);
                    const final = this.parseURLParams(res.respInfo.headers.Location)
                    console.log('final ---', final);
                  } else {
                    // handle other status codes
                  }
                })
                .catch((errorMessage, statusCode) => {
                  console.log('errorMessage ---', errorMessage);
                  console.log('statusCode ---', statusCode);
                })
              return true;
            }
            return true;
          }}
          // originWhitelist={['https://*', 'myvodafone://*']}
          // originWhitelist={['http://', 'https://']}
          // javaScriptEnabled={true}
          // domStorageEnabled={true}
          // startInLoadingState={true}
          // scalesPageToFit={true}
          // mixedContentMode='always'
        />
      </View>
    );
  }
}
