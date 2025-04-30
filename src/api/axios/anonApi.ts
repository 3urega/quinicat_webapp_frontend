import axios from 'axios';
import { baseConfig } from './baseConfig';

export const anonApi = axios.create(baseConfig); 