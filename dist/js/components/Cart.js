import { select, classNames, templates, settings } from "../settings.js";
import CartProduct from "./CartProduct.js";
import {utils} from "../utils.js";

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
    thisCart.dom.form.addEventListener('change', (event) => {
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

export default Cart;