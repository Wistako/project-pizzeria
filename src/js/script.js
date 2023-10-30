/* eslint-disable no-debugger */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      products: '.cart__order-summary > li',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
      error: 'error',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.rednerInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log(data);
    }

    rednerInMenu(){
      const thisProduct = this;
      // Generate HTML
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // Create element using utilis
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      // Find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      // Add element to menu
      menuContainer.appendChild(thisProduct.element);
    }
    render(){
      const thisProduct = this;
      // Generate HTML
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // Create element using utilis
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      generatedDOM.classList.add(classNames.menuProduct.wrapperActive);
      thisProduct.element.insertAdjacentElement('afterend',generatedDOM);
      thisProduct.element.remove();
      thisProduct.element = generatedDOM;

      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    getElements(){
      const thisProduct = this;
      thisProduct.dom = {};
      thisProduct.dom.AccordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.forminputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidget = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidget);
      thisProduct.dom.amountWidget.addEventListener('updated', () =>{
        thisProduct.processOrder();
      })
    }

    initAccordion(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.AccordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && thisProduct.element != activeProduct){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          thisProduct.element.classList.add(classNames.menuProduct.wrapperActive);
        } else {
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
      });
    }

    initOrderForm (){
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.dom.forminputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          let optionImage = thisProduct.dom.imageWrapper.querySelector('[class~="' + paramId + '-' + optionId + '"]');
          if(optionImage && !formData[paramId].includes(optionId)){
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          } else if(optionImage && formData[paramId].includes(optionId)){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
          if(!option.default && formData[paramId].includes(optionId)){
            price += option.price;
          } else if(option.default && !formData[paramId].includes(optionId)){
            price -= option.price;
          }
        }
      }
      // multiple by amount
      price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = thisProduct.data.price;
      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }

    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
      thisProduct.render();
    }
    prepareCartProduct(){
      const thisProduct = this;
      
      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.priceSingle * productSummary.amount;
      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }
    prepareCartProductParams(){
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};  
      
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {}
        }
        for(let optionId in param.options) {
          const option = param.options[optionId];
          
          const optionSelected =  formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected){
            params[paramId].options[optionId] = option.label;
          } 
        }
      }
      return params;
    }
  }
  class AmountWidget{
    constructor (element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.initActions();
      if(thisWidget.dom.input.value){
        thisWidget.setValue(thisWidget.dom.input.value);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }
    }
    getElements(element){
      const thisWidget = this;
      thisWidget.dom = {};
      thisWidget.dom.element = element;
      thisWidget.dom.input = thisWidget.dom.element.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      if( newValue !== thisWidget.value && !isNaN(newValue) && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin){
        thisWidget.value = newValue;
        thisWidget.announce();
      } 
        thisWidget.dom.input.value = thisWidget.value;
      
    }
    announce(){
      const thisWidget = this;
      
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.dom.element.dispatchEvent(event);
    }
    initActions(){
      const thisWidget = this;
      thisWidget.dom.input.addEventListener('change', () =>{
         thisWidget.setValue(thisWidget.dom.input.value);
         
      });
      thisWidget.dom.linkDecrease.addEventListener('click', (event) =>{
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.dom.linkIncrease.addEventListener('click', (event) =>{
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
  }
  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initAction();
      thisCart.update();
    }

    getElements(element){
      const thisCart = this;
      
      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.formSubmit = element.querySelector(select.cart.formSubmit);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
      thisCart.dom.address = element.querySelector(select.cart.address);
    }

    initAction(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', (event) => {
        event.preventDefault();
        thisCart.sentOrder();
      });
      thisCart.dom.phone.addEventListener('change', (event) => {
        event.preventDefault();
        thisCart.validationOrder();
      });
      thisCart.dom.address.addEventListener('change', (event) => {
        event.preventDefault();
        thisCart.validationOrder();
      });
    }

    add(menuProduct){
      const thisCart = this;
      // Generate HTML
      const generatedHTML = templates.cartProduct(menuProduct);
      // Create element using utilis
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update(){
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for (const product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
      thisCart.totalPrice = 0;
      if (subtotalPrice > 0){
        thisCart.totalPrice = deliveryFee + subtotalPrice;
      } 
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      for (const totalPriceDOM of thisCart.dom.totalPrice) {
        totalPriceDOM.innerHTML = thisCart.totalPrice;
      }
    }

    remove(cartProduct){
      const thisCart = this;
      const indexOfProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfProduct, 1);
      thisCart.update();
      console.log(indexOfProduct);
      cartProduct.dom.wrapper.remove();
      
    }
    removeAll(){
      const thisCart = this;
      thisCart.products.splice(0, thisCart.products.length)
      const products = thisCart.dom.productList.querySelectorAll(select.cart.products);
      for (const product of products){
        product.remove();
      }
      thisCart.update();
    }
    sentOrder(){
      const thisCart = this;

      if(thisCart.validationOrder()){
        const url = settings.db.url + '/' + settings.db.orders;
        const payLoad = {};
        payLoad.address = thisCart.dom.address.value;
        payLoad.phone = thisCart.dom.phone.value;
        payLoad.totalPrice = thisCart.totalPrice;
        payLoad.deliveryFee = settings.cart.defaultDeliveryFee;
        payLoad.subtotalPrice = thisCart.totalPrice - payLoad.deliveryFee;
        payLoad.products =[];
        for(let prod of thisCart.products){
          payLoad.products.push(prod.getData());
        }
        console.log('payLoad', payLoad);
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payLoad)
        };
        fetch(url, options)
          .then(function(response){
            return response.json();
          }).then(function(parsedResponse){
            console.log(parsedResponse);
          })
        thisCart.removeAll();
      }
    }
    validationOrder(){
      const thisCart = this;
      
      const phoneValue = thisCart.dom.phone.value;
      const addressValue = thisCart.dom.address.value;

      const phoneFlag = (phoneValue.length == 9 && !phoneValue.startsWith('+48'))|| (phoneValue.length == 12 && phoneValue.startsWith('+48'));
      const addressFlag = addressValue.length > 3;
      const flag = thisCart.products.length > 0 && phoneFlag && addressFlag;
      if(!phoneFlag){
        thisCart.dom.phone.classList.add(classNames.cart.error);
      } else {
        thisCart.dom.phone.classList.remove(classNames.cart.error);
      }
      if(!addressFlag){
        thisCart.dom.address.classList.add(classNames.cart.error);
      } else {
        thisCart.dom.address.classList.remove(classNames.cart.error);
      }
      return flag;
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

    }
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
    }
    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', () =>{
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      });
      thisCartProduct.dom.price.innerHTML = thisCartProduct.priceSingle;
    }
    initActions(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();

      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

        console.log('działa');
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    getData(){
      const thisCartProduct = this;
      const data = {};
      data.id = thisCartProduct.id;
      data.amount = thisCartProduct.amount;
      data.price = thisCartProduct.price;
      data.name = thisCartProduct.name;
      data.params = thisCartProduct.prepareOrderProductParams();

      return data;
    }
    prepareOrderProductParams(){
      const thisCartProduct = this;
      const params = {};
      const thisParams = thisCartProduct.params;
      for(const param in thisParams){
        params[param] = [];
        const options = thisParams[param].options;
        for(const option in options){
          params[param].push(option);
        }
      }
      return params;
    }
  }

  const app = {
    
    initMenu: function(){
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
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
          console.log('parsedRespons', parsedResponse);
          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        });
        console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
