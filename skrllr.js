/**
 * @class: Skrllr
 *
 * Skrllr let you transform your website into a one page scroll website that allows users to scroll one page at a time.
 * I wouldn't mind if you use this piece of code in your project as long as you give credit with a link to my site. www.builtbyedgar.com
 *
 * NOTE: to compile
 * https://babeljs.io/repl/
 */
class Skrllr {

  constructor (element, options) {
    const defaults = {
      container: 'section',
      easing: 'ease',
      transitionTime: 1000,
      pagination: true,
      menu: null,
      updateURL: false,
      hashPrefix: '',
      beforeTransition: null,
      afterTransition: null
    }
    this.settings = Object.assign(defaults, options)
    this.body = document.querySelector('body')
    this.el = document.querySelector(element)
    this.sections = document.querySelectorAll(this.settings.container)
    this.total = this.sections.length
    this.position = 0
    this.sleep = 500
    this.lastTransition = 0
    this.touchStartCoords =  { 'x': -1, 'y': -1 }
    this.touchEndCoords = { 'x': -1, 'y': 1 }
    this.direction = undefined
    this.minDistanceXAxis = 30
    this.maxDistanceYAxis = 30
    this.maxAllowedTime = 1000
    this.startTime = 0
    this.elapsedTime = 0

    this.el.classList.add('skrllr-wrapper')

    this.addOrphanLinks()
    this.addDataAttributes()
    this.checkHash()

    if (isMobile) {
      document.body.scrollTop = 1
      this.addTouchEventListeners()
    } else {
      this.addMouseEventListeners()
    }
  }


  /**
   * Add orphan links
   */
  addOrphanLinks () {
    const links = this.el.querySelectorAll('a[data-skrllr]')
    for (let link of links) {
      link.addEventListener('click', this.onPaginationClickHandler.bind(this), false)
    }
  }


  /**
   * Add navigation menu links
   */
  addDataAttributes () {
    for (let i = 0; i < this.total; i++) {
      this.sections[i].classList.add('skrllr-section')
      this.sections[i].dataset.skrllr = this.settings.hashPrefix + (i + 1)
      // this.position = this.position + 100

      if (this.settings.pagination === true) {
        const items = this.settings.menu.querySelectorAll('li a')
        items[i].dataset.skrllr = this.settings.hashPrefix + (i + 1)
        items[i].href = `#${ this.settings.hashPrefix }${ (i + 1) }`
        items[i].addEventListener('click', this.onPaginationClickHandler.bind(this), false)
      }
    }
  }


  /**
   * Add all mouse event listeners
   */
  addMouseEventListeners () {
    document.addEventListener('mousewheel', this.mouseWheelHandler.bind(this), false)
    document.addEventListener('DOMMouseScroll', this.mouseWheelHandler.bind(this), false)
    document.addEventListener('keydown', this.keyDownHandler.bind(this), false)
  }


  /**
   * Add all touch event listeners
   */
  addTouchEventListeners () {
    document.addEventListener('touchstart', this.swipeStart.bind(this), false)
    document.addEventListener('touchmove', this.swipeMove.bind(this), false)
    document.addEventListener('touchend', this.swipeEnd.bind(this), false)
  }


  /**
   * Check hash for initial load
   */
  checkHash () {
    if (window.location.hash !== '' && window.location.hash !== `#${ this.settings.hashPrefix }1`) {
      const index = window.location.hash.replace(`#${ this.settings.hashPrefix }`, '')
      const item = this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }${ index }']:not(a)`)
      const next = item.dataset.skrllr

      if (next) {
        item.classList.add('active')

        if (this.settings.pagination === true)
          this.settings.menu.querySelector(`a[data-skrllr='${ this.settings.hashPrefix }${ index }']`).classList.add('active')

        if (history.replaceState && this.settings.updateURL === true) {
          const href = window.location.href.substr(0, `${ window.location.href.indexOf('#') }#${ this.settings.hashPrefix }${ index }`)
          history.pushState({}, document.title, href)
        }
      }

      this.position = ((index - 1) * 100) * -1
      this.animate(index, next, item)
    } else {
      this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }1']:not(a)`).classList.add('active')
      if (this.settings.pagination === true)
        this.settings.menu.querySelector(`a[data-skrllr='${ this.settings.hashPrefix }1']`).classList.add('active')
    }
  }


  /**
   * Keyboard events handler
   */
  keyDownHandler (event) {
    switch(event.which) {
      case 38:
        this.goUp()
      break
      case 40:
        this.goDown()
      break
      default: return
    }
    return
  }


  /**
   * Pagination menu click events handler
   */
  onPaginationClickHandler (event) {
    event.preventDefault()
    const index = parseInt(event.target.dataset.skrllr.replace(this.settings.hashPrefix, ''))
    this.goTo(index)
  }


  /**
   * Mouse wheel event handler
   */
  mouseWheelHandler (event) {
    event.preventDefault()
    const evnt = window.event || event
    const delta = Math.max(-1, Math.min(1, (evnt.wheelDelta || -evnt.detail)))
    this.computeTransition(event, delta)
  }


  /**
   * On swipe event starts
   */
  swipeStart (event) {
    event = event ? event : window.event
    event = ('changedTouches' in event) ? event.changedTouches[0] : event
    this.touchStartCoords = { 'x': event.pageX, 'y': event.pageY }
    this.startTime = new Date().getTime()
  }


  /**
   * On swipe event moves
   */
  swipeMove (event) {
    event = event ? event : window.event
    event.preventDefault()
  }


  /**
   * On swipe event ends
   */
  swipeEnd (event) {
    event = event ? event : window.event;
    event = ('changedTouches' in event) ? event.changedTouches[0] : event
    this.touchEndCoords = {
      'x': event.pageX - this.touchStartCoords.x,
      'y': event.pageY - this.touchStartCoords.y
    }
    this.elapsedTime = new Date().getTime() - this.startTime

    if (this.elapsedTime <= this.maxAllowedTime) {
      if (Math.abs(this.touchEndCoords.y) >= this.minDistanceXAxis && Math.abs(this.touchEndCoords.x) <= this.maxDistanceYAxis) {
        this.direction = (this.touchEndCoords.y > 0) ? 'up' : 'down'
        switch (this.direction) {
          case 'up':
            this.goUp()
            break
          case 'down':
            this.goDown()
            break
        }
      }
    }
  }


  /**
   * Check if it can transitioning and the transition direction
   */
  computeTransition (event, delta) {
    let deltaOfInterest = delta
    let timeNow = new Date().getTime()

    if(timeNow - this.lastTransition < this.sleep + this.settings.transitionTime) {
      event.preventDefault()
      return false
    }

    (deltaOfInterest < 0) ? this.goDown() : this.goUp()
    this.lastTransition = timeNow
  }


  /**
   * This method compute what is the next view up and his index
   */
  goUp () {
    const index = parseInt(this.el.querySelector('.active').dataset.skrllr.replace(this.settings.hashPrefix, ''))
    const current = this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }${ index }']:not(a)`)
    const next = this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }${ parseInt(index) - 1 }']:not(a)`)

    if (next)
      this.position = ((parseInt(next.dataset.skrllr.replace(this.settings.hashPrefix, '')) - 1) * 100) * -1
    else
      return

    const nextIndex = parseInt(next.dataset.skrllr.replace(this.settings.hashPrefix, ''))
    current.classList.remove('active')
    next.classList.add('active')

    if (this.settings.pagination === true) {
      this.settings.menu.querySelector(`.active`).classList.remove('active')
      this.settings.menu.querySelector(`a[data-skrllr='${ this.settings.hashPrefix }${ nextIndex }']`).classList.add('active')
    }

    if (history.replaceState && this.settings.updateURL === true) {
      const href = window.location.href.substr(0, window.location.href.indexOf('#')) + `#${ this.settings.hashPrefix }${ index - 1 }`
      history.pushState({}, document.title, href)
    }

    this.animate(index, nextIndex, next)
  }


  /**
   * This method compute what is the next view down and his index
   */
  goDown () {
    const index = parseInt(this.el.querySelector('.active').dataset.skrllr.replace(this.settings.hashPrefix, ''))
    const current = this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }${ index }']:not(a)`)
    const next = this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }${ index + 1 }']:not(a)`)

    if (next)
      this.position = (index * 100) * -1
    else
      return

    const nextIndex = parseInt(next.dataset.skrllr.replace(this.settings.hashPrefix, ''))
    current.classList.remove('active')
    next.classList.add('active')

    if (this.settings.pagination === true) {
      this.settings.menu.querySelector(`.active`).classList.remove('active')
      this.settings.menu.querySelector(`a[data-skrllr='${ this.settings.hashPrefix }${ nextIndex }']`).classList.add('active')
    }

    if (history.replaceState && this.settings.updateURL === true) {
      const href = window.location.href.substr(0, window.location.href.indexOf('#')) + `#${ this.settings.hashPrefix }${ index + 1 }`
      history.pushState({}, document.title, href)
    }

    this.animate(index, nextIndex, next)
  }


  /**
   * This method compute the scroll position based on index
   */
  goTo (index) {
    const current = this.el.querySelector('.active')
    const next = this.el.querySelector(`[data-skrllr='${ this.settings.hashPrefix }${ index }']:not(a)`)

    if (next) {
      const nextIndex = parseInt(next.dataset.skrllr.replace(this.settings.hashPrefix, ''))
      current.classList.remove('active')
      next.classList.add('active')

      if (this.settings.pagination === true) {
        this.settings.menu.querySelector(`.active`).classList.remove('active')
        this.settings.menu.querySelector(`a[data-skrllr='${ this.settings.hashPrefix }${ index }']`).classList.add('active')
      }

      this.position = ((index - 1) * 100) * -1

      if (history.replaceState && this.settings.updateURL === true) {
        const href = window.location.href.substr(0, window.location.href.indexOf('#')) + `#${ this.settings.hashPrefix }${ index }`
        history.pushState({}, document.title, href)
      }

      this.animate(current.dataset.skrllr, nextIndex, next)
    }
  }


  /**
   * This method fires the 'scroll' transition. Basically set a css transformations
   * to the main element and listen when this transition is finished
   */
  animate (index, nextIndex, next) {
    if (typeof this.settings.beforeTransition === 'function') this.settings.beforeTransition(index, nextIndex, next)

    const transitionEndHandler = (event) => {
      event.preventDefault()
      event.target.removeEventListener('transitionend', transitionEndHandler)
      if (typeof this.settings.afterTransition === 'function') return this.settings.afterTransition(index, nextIndex, next)
    }

    this.el.addEventListener('transitionend', transitionEndHandler, false)
    this.el.style.cssText = `transform: translate3d(0, ${ this.position }vh, 0);
                             transition: transform ${ this.settings.transitionTime }ms ${ this.settings.easing };`
  }
}

const isMobile = (function(a){
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
})(navigator.userAgent || navigator.vendor || window.opera)
