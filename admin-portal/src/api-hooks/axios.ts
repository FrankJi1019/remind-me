import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'https://9cdd6gmyqb.execute-api.ap-southeast-2.amazonaws.com/prod'
})

export default apiClient