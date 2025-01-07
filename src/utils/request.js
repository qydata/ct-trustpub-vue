import axios from 'axios'
// TODO 这里是测试代码
const baseURL = process.env.VUE_APP_BASE_URL
// var baseURL =  "http://localhost:8080/";
// 1.创建axios实例
const instance = axios.create({
  baseURL: baseURL,
  timeout: 5000
  // withCredentials: true,
})

export function Request(config) {
  return instance(config)
}

// 请求拦截
instance.interceptors.request.use((config) =>
  //为请求头对象，添加Token验证的Authorization字段
  // console.log(window.localStorage.getItem('token'));
  // config.headers.Token = window.localStorage.getItem("token");
  config
)
//拦截隐藏进度条
//再次拦截，为了获取数据中data中的data，拦截第一次data
instance.interceptors.response.use((res) => res.data)

export function postRequest(config) {
  // 1.创建axios实例
  const instance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    method: 'post',
    responseType: 'blob',
    headers: {
      'Access-Control-Allow-Origin': 'localhost'
    }
  })
  return instance(config)
}

export {baseURL}
