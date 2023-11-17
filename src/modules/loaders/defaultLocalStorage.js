export const defaultLocalData = {
  name: "",
  someIds: 0,
  url: "",
  method: "",
  authorization: {
    type: "bearer-auth",
    params: {
      "no-auth": {

      },
      "basic-auth": {
        login: '',
        password: '',
      },
      "bearer-auth": {
        token: '',
      }
    }
  },
  headers: [
    {
      key: 'User-Agent',
      value: 'Postwoman/0.0.1',
      description: ''
    },
    {
      key: 'Accept',
      value: '*/*',
      description: ''
    },
    {
      key: 'Accept-Encoding',
      value: 'gzip, deflate, br',
      description: ''
    },
    {
      key: 'Connection',
      value: 'keep-alive',
      description: ''
    },
  ],
  body: {
    type: "json",
    params: {
      "x-www-form-urlencoded": [
      ],
      "json": []
    },
    raws: {
      "json": "",
    }
  }
}