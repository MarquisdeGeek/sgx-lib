var sgx = sgx || {};
sgx.lib = sgx.lib || {};
sgx.lib.network = sgx.lib.network || {};


sgx.lib.network.parseAddress = function(address) {
  return new sgx.lib.network.ipAddress(address); 
}

sgx.lib.network.parseSubnet = function(subnet) {
  return new sgx.lib.network.ipSubnet(subnet); 
}

sgx.lib.network.ipSubnet = function(subnet) {
var components = subnet.split('/');
var bitsNetMask = components[1];
var baseAddress = sgx.lib.network.parseAddress(components[0]);
var hex = baseAddress.getAsInt();
var mask = ((1 << bitsNetMask) - 1) << (32-bitsNetMask);
var count = (1 << (32-bitsNetMask)) - 1;

  return {
    getAddressList: function() {
      var ipList = [];
      var integralAddress;

      for(var i=0;i<count;++i) {
        integralAddress = ((hex & mask) | i);
        ipList.push(sgx.lib.network.parseAddress(integralAddress));
      }

      return ipList;
    },

    getAddressCount: function() {
      return count;
    }
  }
}

sgx.lib.network.ipAddress = function(address) {
var octets;

  if (typeof address == 'number') {
    octets = [];
    octets[0] = ((address >>> 24) & 0xff);
    octets[1] = ((address >>> 16) & 0xff);
    octets[2] = ((address >>>  8) & 0xff);
    octets[3] = ((address >>>  0) & 0xff);

  } else if (typeof address == 'string') {
    octets = address.split(/\s*?\.\s*?/);
    for(var i=0;i<octets.length;++i) {
        octets[i] = parseInt(octets[i], 10);
      }
  }
  
  return {
    isClassA: function() {
      return (octets[0] < 128) ? true : false;
    },
    
    isClassB: function() {
      return (octets[0] >= 128 && octets[0] < 192) ? true : false;
    },
    
    isClassC: function() {
      return (octets[0] >= 192) ? true : false;
    },
    
    isLoopback: function() {
      var asInt = this.getAsInt();
      if ((asInt >>> 24) === 0x7f) {  // 127.0.0.0/8
        return true;
      }
      return false;
    },
    
    isPrivate: function() {
      var asInt = this.getAsInt();
      if ((asInt >>> 24) === 0x0A) {  // 10. 
        return true;
      } else if ((asInt >>> 20) === 0xAC1) {  // 172.16 to 172.31
        return true;
      } else if ((asInt >>> 16) === 0xC0A8) {  // 192.168.x.x
        return true;
      }
      return false;
    },
    
    getOctets: function() {
      return octets;
    },

    getAsQuad: function() {
      var result = '';
      var prepend = '';
      for(var i=0;i<octets.length;++i) {
        result += prepend + octets[i];
        prepend = '.';
      }
      return result;
    },

    getAsHexString: function() {
      var hex = '';
      var d2h = function(v) { return ("0" + v.toString(16)).slice(-2); }

      for(var i=0;i<octets.length;++i) {
        hex += d2h(octets[i]);
      }

      return hex;          
    },

    getAsInt: function() {
      var hex = this.getAsHexString(this);
      return parseInt(hex, 16);
    }
  };
}
