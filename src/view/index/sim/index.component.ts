// Copyright @ 2018-2021 xiejiahe. All rights reserved. MIT license.

import config from '../../../../nav.config'
import { Component } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { INavProps, INavThreeProp } from 'src/types'
import {
  fuzzySearch,
  queryString,
  setWebsiteList,
  toggleCollapseAll,
  totalWeb,
  matchCurrentList
} from 'src/utils'
import { isLogin } from 'src/utils/user'
import { initRipple, setAnnotate } from 'src/utils/ripple'
import { websiteList } from 'src/store'
import { settings } from 'src/store'

const { gitRepoUrl } = config
const { title } = settings
let sidebarEl: HTMLElement;

@Component({
  selector: 'app-sim',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export default class SimComponent {

  constructor (private router: Router, private activatedRoute: ActivatedRoute) {}

  websiteList: INavProps[] = websiteList
  currentList: INavThreeProp[] = []
  id: number = 0
  page: number = 0
  gitRepoUrl: string = gitRepoUrl
  title: string = title
  posterImageUrls?: string = settings.simThemeImages[0].src
  jumpUrl = settings.simThemeImages[0].url
  description: string = settings.simThemeDesc.replace('${total}', String(totalWeb()))
  isLogin = isLogin

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(() => {
      const tempPage = this.page
      const { id, page, q } = queryString()
      this.page = page
      this.id = id

      if (q) {
        this.currentList = fuzzySearch(this.websiteList, q)
      } else {
        this.currentList = matchCurrentList()
      }

      if (tempPage !== page) {
        setAnnotate()
      }

      setWebsiteList(this.websiteList)
    })
  }

  handleJumpUrl() {
    if (this.jumpUrl) {
      window.open(this.jumpUrl)
    }
  }

  onScroll = () => {
    const y = window.scrollY
    if (!sidebarEl) {
      sidebarEl = document.getElementById('sidebar')
    }

    if (sidebarEl) {
      const height = this.posterImageUrls ? 438 : 10
      if (y >= height) {
        sidebarEl.classList.add('fix')
      } else {
        sidebarEl.classList.remove('fix')
      }
    }
  }

  ngOnDestroy() {
    window.removeEventListener('scroll',  this.onScroll)
  }

  ngAfterViewInit() {
    initRipple()
    setAnnotate();

    window.addEventListener('scroll', this.onScroll)
  }

  handleSidebarNav(index) {
    const { page } = queryString()
    this.websiteList[page].id = index
    this.router.navigate([this.router.url.split('?')[0]], { 
      queryParams: {
        page,
        id: index,
        _: Date.now()
      }
    })
  }

  handleCilckTopNav(idx) {
    const id = this.websiteList[idx].id || 0
    this.router.navigate([this.router.url.split('?')[0]], {
      queryParams: {
        page: idx,
        id,
        _: Date.now()
      }
    })
  }

  onCollapse = (item, index) => {
    item.collapsed = !item.collapsed
    this.websiteList[this.page].nav[this.id].nav[index] = item
    setWebsiteList(this.websiteList)
  }

  onCollapseAll = () => {
    toggleCollapseAll(this.websiteList)
  }

  collapsed() {
    try {
      return websiteList[this.page].nav[this.id].collapsed
    } catch (error) {
      return false
    }
  }
}
