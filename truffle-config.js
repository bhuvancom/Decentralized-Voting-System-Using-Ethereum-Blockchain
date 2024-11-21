module.exports = {
  compilers: {
    solc: {
      version: "^0.5.15",
    },
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    loc_development_development: {
      network_id: "*",
      port: 7545,
      from: "0x39849594fff4b70c18054fdb7f3d392e422930e556d7f7a6c1342f012de91809",
      host: "127.0.0.1"
    }
  }
};
