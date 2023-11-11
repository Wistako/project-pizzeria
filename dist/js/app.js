import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import homePage from './components/homePage.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        // get page ID from href
        const id = clickedElement.getAttribute('href').replace('#', '');

        // activetePages with pageId
        thisApp.activatePage(id);

        // change URL hash 
        window.location.hash = '#/' + id;
      });

    }
  },
  activatePage(pageId){
    const thisApp = this;

    // add class "active" to matching pages, remove from non-matching
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, pageId == page.id);
    }

    // add class "active" to matching links, remove from non-matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initMenu: function(){
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initBooking: function(){
    const bookingElem = document.querySelector(select.containerOf.booking);
    
    new Booking(bookingElem);
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', (event) => {
      thisApp.cart.add(event.detail.Product);
    })
  },
  initHome(){
    const thisApp = this;
    
    thisApp.homeElem = document.querySelector(select.containerOf.homePage);
    thisApp.homePage = new homePage(thisApp.homeElem);
    
    
    thisApp.homeElem.addEventListener('link', (e)=>{
      thisApp.activatePage(e.detail.pageId);
      console.log(e.detail.pageId);
    })
  },
  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initHome();
    thisApp.initBooking();
  },
};

  app.init();