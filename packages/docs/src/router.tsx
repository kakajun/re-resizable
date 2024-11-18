import { createHashRouter, Navigate } from 'react-router-dom'
import HomeLayout from './views/Home'
import React from 'react'
import Basic from './examples/Basic'
import Auto from './examples/Auto'
import Size from './examples/Size'
import Snap from './examples/Snap'
import Extra from './examples/Extra'
import Aspect from './examples/Aspect'
import Min from './examples/Min'
import Max from './examples/Max'
import Vwvh from './examples/Vwvh'
import Echart from './examples/Echart'


export const menuRoutes = [
  {
    path: '/basic',
    element: <Basic></Basic>,
    meta: {
      title: 'basic'
    }
  },
  {
    path: '/auto',
    element: <Auto></Auto>,
    meta: {
      title: 'auto'
    }
  },
  {
    path: '/size',
    element: <Size></Size>,
    meta: {
      title: 'size'
    }
  },
  {
    path: '/snap',
    element: <Snap></Snap>,
    meta: {
      title: 'snap'
    }
  },
  {
    path: '/aspect',
    element: <Aspect></Aspect>,
    meta: {
      title: 'aspect'
    }
  },
  {
    path: '/extra',
    element: <Extra></Extra>,
    meta: {
      title: 'extra'
    }
  },
  {
    path: '/min',
    element: <Min></Min>,
    meta: {
      title: 'min'
    }
  },
  {
    path: '/max',
    element: <Max></Max>,
    meta: {
      title: 'max'
    }
  },
  {
    path: '/vwvh',
    element: <Vwvh></Vwvh>,
    meta: {
      title: 'vwvh'
    }
  },
  {
    path: '/echart',
    element: <Echart></Echart>,
    meta: {
      title: 'echart'
    }
  }
]

export const router = createHashRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/basic" replace />
      },
      ...menuRoutes
    ]
  }
])
