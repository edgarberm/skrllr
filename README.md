# skrllr
Another version of the OnePage Scroll jQuery plugin (https://github.com/peachananr/onepage-scroll) but in pure JS.

A working example [here](http://builtbyedgar.com/lab/skrllr/)


## Usage

### The HTML markup

```html
<div class="wrapper">
  <main>
    <section class="section">
      <h1>Section 01</h1>
      <a href="#3" data-skrllr="3">Go to section 03</a>
    </section>
    <section class="section">
      <h1>Section 02</h1>
    </section>
    <section class="section">
      <h1>Section 03</h1>
    </section>
    <section class="section">
      <h1>Section 04</h1>
    </section>
    <section class="section">
      <h1>Section 05</h1>
    </section>
  </main>
</div>

<nav class="main-menu">
  <ul class="pagination">
    <li><a></a></li>
    <li><a></a></li>
    <li><a></a></li>
    <li><a></a></li>
    <li><a></a></li>
  </ul>
</nav>
```

### The css style

```css
body, html {
  display: block;
  position: fixed;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  font-family: 'Helvetica Neue', helvetica, sans-serif;
  overflow: hidden;
}

.skrllr-wrapper {
  position: relative;
  display: block;
  width: 100vw;
  height: 100%;
  padding: 0;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.skrllr-section {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.wrapper {
  height: 100% !important;
  height: 100%;
  margin: 0 auto;
  overflow: hidden;
}
```

### The javascript code

```javascript
document.addEventListener('DOMContentLoaded', (event) => {
  const skrllr = new Skrllr('main', {
    transitionTime: 1800,
    easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
    updateURL: true,
    menu: document.querySelector('.pagination'),
    beforeTransition: (index, nextIndex, next) => before(index, nextIndex, next),
    afterTransition: (index, nextIndex, next) => after(index, nextIndex, next),
  })

  function before (index, nextIndex, next) {
    console.log('Before transition');
    console.log(index);
    console.log(nextIndex);
    console.log(next);
  }

  function after (index, nextIndex, next) {
    console.log('After transition');
    console.log(index);
    console.log(nextIndex);
    console.log(next);
  }
}, false)
    
