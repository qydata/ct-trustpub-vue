// Copyright (C) 2021 CTChain Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

import CaptchaTestPanel from '@/views/CaptchaTestPanel'
import Overview from '@/views/Overview'
import Publicity from '@/views/Publicity'
import {createRouter, createWebHistory} from 'vue-router'
import ChatPanel from '../views/ChatPanel.vue'
import Discover from '../views/Discover.vue'
import Index from '../views/Index.vue'
import News from '../views/News.vue'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/publicity',
    name: 'Publicity',
    component: Publicity
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/governance',
    name: 'Governance',
    component: () => {
    },
    disabled: true
  },
  {
    path: '/chatPanel',
    name: 'ChatPanel',
    component: ChatPanel
  },
  {
    path: '/captchaTestPanel',
    name: 'CaptchaTestPanel',
    component: CaptchaTestPanel
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
