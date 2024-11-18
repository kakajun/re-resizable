import { createHashRouter, Navigate } from 'react-router-dom'
import HomeLayout from './views/Home'
import React from 'react'
import Basic from './examples/Basic'
import Auto from './examples/Auto'
import Size from './examples/Size'
import Snap from './examples/Snap'

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
